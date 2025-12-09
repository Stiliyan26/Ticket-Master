import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSeatDto {
  @IsNotEmpty()
  @IsString()
  readonly section!: string;

  @IsNotEmpty()
  @IsString()
  readonly row!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly number!: number;

  @IsNotEmpty()
  @IsUUID(4)
  readonly venueId!: string;
}
