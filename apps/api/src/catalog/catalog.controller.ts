import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('events')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get active events' })
  @ApiResponse({ status: 200, description: 'List of active events' })
  async getEvents(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.catalogService.getActiveEvents({
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('events/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEventById(@Param('id') id: string) {
    return this.catalogService.getEventById(id);
  }

  @Get('packages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get active packages' })
  @ApiQuery({
    name: 'eventId',
    required: false,
    description: 'Filter packages by event ID',
  })
  @ApiResponse({ status: 200, description: 'List of active packages' })
  async getPackages(@Query('eventId') eventId?: string) {
    return this.catalogService.getActivePackages(eventId);
  }

  @Get('packages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get package by ID' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: 200, description: 'Package details' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async getPackageById(@Param('id') id: string) {
    return this.catalogService.getPackageById(id);
  }
}
