import { Repository, ObjectLiteral } from 'typeorm';

import { handleDatabaseError } from '../utils/database-error.util';
import { TransactionExecutor } from '../utils/transaction-executor.util';
import {
  transactionStorage,
  TransactionOptions,
} from '../utils/transaction-storage.util';

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
        try {
          return await originalMethod.apply(this, args);
        } catch (error: unknown) {
          const { errorContext, messageOverrides } = options;

          if (errorContext) {
            return handleDatabaseError(error, {
              messageOverrides,
              context: errorContext,
            }) as never;
          }

          throw error;
        }
      }

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
