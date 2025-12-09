import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsUUID(4)
  readonly userId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, { each: true })
  readonly ticketIds!: string[];
}
