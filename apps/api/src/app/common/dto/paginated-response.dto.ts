import { Expose, Type } from 'class-transformer';
import { ClassConstructor } from 'class-transformer';

export class PaginatedResponseDto<T> {
  @Expose()
  declare data: T[];

  @Expose()
  declare total: number;

  @Expose()
  declare page: number;

  @Expose()
  declare limit: number;
}

export function createPaginatedResponseDto<T>(
  itemDto: ClassConstructor<T>
): ClassConstructor<PaginatedResponseDto<T>> {
  class PaginatedResponseDtoHost extends PaginatedResponseDto<T> {
    @Expose()
    @Type(() => itemDto)
    declare data: T[];
  }

  return PaginatedResponseDtoHost;
}
