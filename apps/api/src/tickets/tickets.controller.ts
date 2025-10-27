import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Buy a ticket' })
  @ApiResponse({ status: 201, description: 'Ticket purchased successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async purchaseTicket(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: any
  ) {
    return this.ticketsService.purchaseTicket(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Get user's tickets" })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  async getUserTickets(@CurrentUser() user: any) {
    return this.ticketsService.getUserTickets(user.userId);
  }
}
