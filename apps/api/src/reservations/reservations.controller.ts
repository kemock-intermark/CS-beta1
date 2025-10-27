import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';

@ApiTags('reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Event/Package/Table not found' })
  async createReservation(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: any
  ) {
    return this.reservationsService.createReservation(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Get user's reservations" })
  @ApiResponse({ status: 200, description: 'List of reservations' })
  async getUserReservations(@CurrentUser() user: any) {
    return this.reservationsService.getUserReservations(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiResponse({ status: 200, description: 'Reservation details' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async getReservationById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reservationsService.getReservationById(id, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel reservation' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async cancelReservation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reservationsService.cancelReservation(id, user.userId);
  }
}
