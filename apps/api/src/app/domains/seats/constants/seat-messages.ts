/**
 * Error messages for seat operations
 */
export const SEAT_ERROR_MESSAGES = {
  UNIQUE_CONSTRAINT_VIOLATION:
    'A seat with the same section, row, and number already exists for this venue',
  NOT_FOUND: (id: string) => `Seat with ID "${id}" not found`,
  VENUE_NOT_FOUND: (id: string) => `Venue with ID "${id}" not found`,
  FOREIGN_KEY_VIOLATION:
    'Seat cannot be removed while related records exist.',
  EMPTY_BATCH: 'At least one seat must be provided',
  BATCH_TOO_LARGE: (max: number) =>
    `Cannot create more than ${max} seats in a single request`,
} as const;
