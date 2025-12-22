import { Repository, DataSource, ObjectLiteral } from 'typeorm';

import { handleDatabaseError } from './database-error.util';
import {
  transactionStorage,
  TransactionOptions,
} from './transaction-storage.util';

export class TransactionExecutor<T extends object> {
  constructor(
    private readonly instance: T,
    private readonly dataSource: DataSource,
    private readonly options: TransactionOptions<T>,
    private readonly originalMethod: (...args: unknown[]) => Promise<unknown>,
    private readonly args: unknown[],
    private readonly thisContext: T
  ) {}

  async execute(): Promise<unknown> {
    try {
      this.patchRepositories();

      return await this.dataSource.transaction(async (transactionManager) => {
        // Store the manager in AsyncLocalStorage for context-aware repositories to pick up.
        return transactionStorage.run(transactionManager, async () => {
          return await this.originalMethod.apply(this.thisContext, this.args);
        });
      });
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  private patchRepositories(): void {
    const instanceRecord = this.instance as Record<string, unknown>;

    Object.values(instanceRecord).forEach((val) => {
      if (!(val instanceof Repository)) {
        return;
      }

      const repo = val as Repository<ObjectLiteral>;
      const descriptor = Object.getOwnPropertyDescriptor(repo, 'manager');

      if (descriptor?.get) {
        return;
      }

      const originalManager = repo.manager;

      Object.defineProperty(repo, 'manager', {
        get() {
          return transactionStorage.getStore() || originalManager;
        },
        enumerable: true,
        configurable: true,
      });
    });
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
}
