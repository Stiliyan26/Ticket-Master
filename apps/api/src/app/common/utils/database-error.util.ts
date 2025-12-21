import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { POSTGRES_ERROR_CODES } from '../constants/database-errors';

/**
 * Database operation types for error message generation.
 */
export const DB_OPERATIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  REMOVE: 'remove',
} as const;

export type DbOperation = (typeof DB_OPERATIONS)[keyof typeof DB_OPERATIONS];

type PgError = { code: string; message: string } & Error;
type ErrorHandler = (message?: string) => never;

const CODE_HANDLERS: Record<string, ErrorHandler> = {
  [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: (message) => {
    throw new ConflictException(
      message || 'A record with these unique values already exists.'
    );
  },
  [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: (message) => {
    throw new ConflictException(
      message ||
        'Operation blocked by related records. Remove dependencies first.'
    );
  },
  [POSTGRES_ERROR_CODES.NOT_NULL_VIOLATION]: (message) => {
    throw new BadRequestException(message || 'Missing a required value.');
  },
};

function isPgError(error: unknown): error is PgError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

export function isPgErrorWithCode(
  error: unknown,
  code: string
): error is PgError {
  return isPgError(error) && (error as PgError).code === code;
}

/**
 * Generates common error messages for database operations based on entity name.
 */
export function getEntityErrorMessage(
  entityName: string,
  operation: DbOperation,
  errorCode: string
): string {
  const entityLower = entityName.toLowerCase();

  switch (errorCode) {
    case POSTGRES_ERROR_CODES.UNIQUE_VIOLATION:
      return `A ${entityLower} with these unique values already exists.`;

    case POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      if (operation === 'remove') {
        return `Cannot remove ${entityLower}: it has associated records.`;
      }
      return `Operation blocked: referenced ${entityLower} not found.`;

    case POSTGRES_ERROR_CODES.NOT_NULL_VIOLATION:
      return `Missing required value for ${entityLower}.`;

    default:
      return `Database error occurred while ${operation}ing ${entityLower}.`;
  }
}

/**
 * Creates message overrides for common entity operations.
 * Pass entity name (e.g., Seat.name) for type safety.
 */
export function createEntityMessageOverrides(
  entityName: string,
  operation: DbOperation
): Record<string, string> {
  return {
    [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: getEntityErrorMessage(
      entityName,
      operation,
      POSTGRES_ERROR_CODES.UNIQUE_VIOLATION
    ),
    [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: getEntityErrorMessage(
      entityName,
      operation,
      POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION
    ),
    [POSTGRES_ERROR_CODES.NOT_NULL_VIOLATION]: getEntityErrorMessage(
      entityName,
      operation,
      POSTGRES_ERROR_CODES.NOT_NULL_VIOLATION
    ),
  };
}

export function handleDatabaseError(
  error: unknown,
  {
    messageOverrides,
    extraHandlers,
    defaultHandler,
    context,
  }: {
    messageOverrides?: Record<string, string>;
    extraHandlers?: Record<string, ErrorHandler>;
    defaultHandler?: (error: unknown) => never;
    context?: string;
  } = {}
) {
  const logger = new Logger(context || 'DatabaseErrorHandler');

  if (isPgError(error)) {
    // Log the full error details for debugging
    logger.error(
      `Database error [${error.code}]: ${error.message}`,
      error.stack
    );

    const handlers = { ...CODE_HANDLERS, ...extraHandlers };
    const handler = handlers[error.code];

    if (handler) {
      handler(messageOverrides?.[error.code]);
    }

    // Unknown PostgreSQL error - don't expose details to client
    logger.error(`Unhandled PostgreSQL error code: ${error.code}`);
    throw new InternalServerErrorException(
      'A database error occurred. Please try again later.'
    );
  }

  // Non-PostgreSQL error
  if (defaultHandler) {
    logger.error('Database operation failed with custom handler', error);
    return defaultHandler(error);
  }

  // Unknown error - log it but don't expose details
  logger.error('Unexpected database error', error);
  throw new InternalServerErrorException(
    'An unexpected error occurred. Please try again later.'
  );
}
