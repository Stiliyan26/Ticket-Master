import { Repository, FindManyOptions, ObjectLiteral } from 'typeorm';

/**
 * Response structure for paginated queries.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: FindManyOptions<T>,
  page: number,
  limit: number
): Promise<PaginatedResponse<T>> {
  const skip = (page - 1) * limit;

  const [data, total] = await repository.findAndCount({
    ...options,
    take: limit,
    skip,
  });

  return { data, total, page, limit };
}
