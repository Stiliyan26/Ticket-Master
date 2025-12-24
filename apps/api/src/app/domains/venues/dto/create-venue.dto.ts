import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({
    description: 'The unique name of the venue',
    example: 'Madison Square Garden',
  })
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @ApiProperty({
    description: 'The physical address of the venue',
    example: '4 Pennsylvania Plaza, New York, NY 10001',
  })
  @IsString()
  @IsNotEmpty()
  readonly address!: string;
}
