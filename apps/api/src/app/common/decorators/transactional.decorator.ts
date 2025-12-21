import { AsyncLocalStorage } from 'async_hooks';
import { Repository, DataSource, EntityManager, ObjectLiteral } from 'typeorm';
import { handleDatabaseError } from '../utils/database-error.util';

// ============================================================================
// Types
// ============================================================================

/**
 * Tracks a repository whose manager was swapped for restoration later.
 */
interface ModifiedRepository {
  repo: Repository<ObjectLiteral>;
  originalManager: EntityManager;
}

/**
 * Helper to extract keys of T that are Repository instances.
 */
type RepoPropertyNames<T> = {
  [K in keyof T]: T[K] extends Repository<ObjectLiteral> ? K : never;
}[keyof T] &
  string;

/**
 * Options for the Transactional decorator.
 */
interface TransactionOptions<T> {
  repoKey?: RepoPropertyNames<T>;
  errorContext?: string;
  messageOverrides?: Record<string, string>;
}

// ============================================================================
// AsyncLocalStorage for transaction propagation
// ============================================================================

/**
 * AsyncLocalStorage for tracking active transaction managers.
 * Allows nested transactions to reuse the same manager.
 */
export const transactionStorage = new AsyncLocalStorage<EntityManager>();

// ============================================================================
// TransactionExecutor - encapsulates all transaction logic
// ============================================================================

class TransactionExecutor<T extends object> {
  private modifiedRepos: ModifiedRepository[] = [];

  constructor(
    private readonly instance: T,
    private readonly dataSource: DataSource,
    private readonly options: TransactionOptions<T>,
    private readonly originalMethod: (...args: unknown[]) => Promise<unknown>,
    private readonly args: unknown[],
    private readonly thisContext: T
  ) {}

  /**
   * Executes the method within a transaction.
   */
  async execute(): Promise<unknown> {
    try {
      return await this.dataSource.transaction(async (transactionManager) => {
        return transactionStorage.run(transactionManager, async () => {
          this.swapManagers(transactionManager);

          try {
            return await this.originalMethod.apply(this.thisContext, this.args);
          } finally {
            this.restoreManagers();
          }
        });
      });
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  swapManagers(transactionManager: EntityManager): void {
    const repos = this.findAllRepositories(transactionManager);

    this.modifiedRepos = repos.map((repo) => {
      const originalManager = repo.manager;

      // NOTE: TypeORM doesn't expose a public API for swapping managers.
      // We use Object.defineProperty to avoid 'any' casting while still
      // swapping the internal manager for the transaction.
      Object.defineProperty(repo, 'manager', {
        value: transactionManager,
        writable: true,
        configurable: true,
      });

      return { repo, originalManager };
    });
  }

  restoreManagers(): void {
    for (const { repo, originalManager } of this.modifiedRepos) {
      Object.defineProperty(repo, 'manager', {
        value: originalManager,
        writable: true,
        configurable: true,
      });
    }
  }

  private handleError(error: unknown): never {
    const { errorContext, messageOverrides } = this.options;

    if (errorContext) {
      return handleDatabaseError(error, {
        messageOverrides,
        context: errorContext,
      });
    }

    throw error;
  }

  private findAllRepositories(
    transactionManager: EntityManager
  ): Repository<ObjectLiteral>[] {
    const instanceRecord = this.instance as Record<string, unknown>;

    return Object.values(instanceRecord).filter(
      (val): val is Repository<ObjectLiteral> =>
        val instanceof Repository && val.manager !== transactionManager
    );
  }
}

// ============================================================================
// Decorator
// ============================================================================

/**
 * Decorator to wrap a method in a database transaction.
 * Supports nesting and automatic repository manager swapping.
 *
 * @param options - Configuration for the transaction and error handling
 */
export function Transactional<T extends object>(
  options: TransactionOptions<T> = {}
) {
  return function <Args extends unknown[], Return>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: Args) => Promise<Return>>
  ) {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      throw new Error('@Transactional() can only be applied to methods');
    }

    descriptor.value = async function (
      this: T,
      ...args: Args
    ): Promise<Return> {
      const { repoKey } = options;
      const existingManager = transactionStorage.getStore();

      if (existingManager) {
        const executor = new TransactionExecutor(
          this,
          existingManager.connection,
          options,
          originalMethod as (...args: unknown[]) => Promise<unknown>,
          args,
          this
        );

        executor.swapManagers(existingManager);

        try {
          return await originalMethod.apply(this, args);
        } finally {
          executor.restoreManagers();
        }
      }

      // Find repository via key or discovery
      let repository: Repository<ObjectLiteral> | undefined;
      const instanceRecord = this as Record<string, unknown>;

      if (repoKey) {
        const value = instanceRecord[repoKey];

        if (value instanceof Repository) {
          repository = value;
        }
      } else {
        repository = Object.values(instanceRecord).find(
          (val): val is Repository<ObjectLiteral> => val instanceof Repository
        );
      }

      const dataSource = repository?.manager.connection;

      if (!dataSource) {
        throw new Error(
          `@Transactional() failed: No DataSource found on ${this.constructor.name}. ` +
            `Please provide repoKey or ensure a Repository is injected.`
        );
      }

      const executor = new TransactionExecutor(
        this,
        dataSource,
        options,
        originalMethod as (...args: unknown[]) => Promise<unknown>,
        args,
        this
      );

      return executor.execute() as Promise<Return>;
    };

    return descriptor;
  };
}
