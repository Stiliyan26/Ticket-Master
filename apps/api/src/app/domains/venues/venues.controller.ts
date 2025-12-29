import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenueResultDto } from './dto/venue-result.dto';
import { Venue } from './entities/venue.entity';
import { Serialize } from '../../common/interceptors/serialize.interceptor';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new venue' })
  @ApiCreatedResponse({
    description: 'The venue has been successfully created.',
    type: VenueResultDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @Serialize(VenueResultDto)
  create(@Body() createVenueDto: CreateVenueDto): Promise<Venue> {
    return this.venuesService.create(createVenueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all venues' })
  @ApiOkResponse({
    description: 'Return all venues.',
    type: [VenueResultDto],
  })
  @Serialize(VenueResultDto)
  findAll(): Promise<Venue[]> {
    return this.venuesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a venue by id' })
  @ApiOkResponse({
    description: 'Return the venue found by id.',
    type: VenueResultDto,
  })
  @ApiNotFoundResponse({ description: 'Venue not found.' })
  @Serialize(VenueResultDto)
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<Venue> {
    return this.venuesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a venue' })
  @ApiOkResponse({
    description: 'The venue has been successfully updated.',
    type: VenueResultDto,
  })
  @ApiNotFoundResponse({ description: 'Venue not found.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @Serialize(VenueResultDto)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVenueDto: UpdateVenueDto
  ): Promise<Venue> {
    return this.venuesService.update(id, updateVenueDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a venue' })
  @ApiNoContentResponse({
    description: 'The venue has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Venue not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.venuesService.remove(id);
  }
}
