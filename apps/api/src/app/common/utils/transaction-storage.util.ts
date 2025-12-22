import { AsyncLocalStorage } from 'async_hooks';
import { Repository, EntityManager, ObjectLiteral } from 'typeorm';

export type RepoPropertyNames<T> = {
  [K in keyof T]: T[K] extends Repository<ObjectLiteral> ? K : never;
}[keyof T] &
  string;

export interface TransactionOptions<T> {
  repoKey?: RepoPropertyNames<T>;
  errorContext?: string;
  messageOverrides?: Record<string, string>;
}

export const transactionStorage = new AsyncLocalStorage<EntityManager>();
