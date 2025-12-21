import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsNotEmpty()
  @IsDateString()
  readonly date!: string;

  // @Type(() => Number) removed - now handled globally
  @IsNumber()
  @IsPositive()
  readonly basePrice!: number;

  @IsNotEmpty()
  @IsUUID(4)
  readonly venueId!: string;
}
