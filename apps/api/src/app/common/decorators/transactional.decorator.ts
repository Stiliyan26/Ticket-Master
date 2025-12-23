import { Repository, DataSource, ObjectLiteral } from 'typeorm';

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
      const dataSource = getDataSource(this, options);

      const executor = new TransactionExecutor(
        this,
        dataSource,
        options,
        originalMethod as (...args: unknown[]) => Promise<unknown>,
        args
      );

      return executor.execute() as Promise<Return>;
    };

    return descriptor;
  };
}

function getDataSource<T extends object>(
  instance: T,
  options: TransactionOptions<T>
): DataSource {
  const existingManager = transactionStorage.getStore();

  if (existingManager) {
    return existingManager.connection;
  }

  const repository = findRepository(instance, options.repoKey);

  if (!repository) {
    throw new Error(
      `@Transactional() failed: No DataSource found on ${instance.constructor.name}. ` +
        `Please provide repoKey or ensure a Repository is injected.`
    );
  }

  return repository.manager.connection;
}

function findRepository<T extends object>(
  instance: T,
  repoKey?: string
): Repository<ObjectLiteral> | undefined {
  const instanceRecord = instance as Record<string, unknown>;

  if (repoKey) {
    const value = instanceRecord[repoKey];

    return value instanceof Repository ? value : undefined;
  }

  return Object.values(instanceRecord).find(
    (val): val is Repository<ObjectLiteral> => val instanceof Repository
  );
}
