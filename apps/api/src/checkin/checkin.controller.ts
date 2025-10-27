import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';

@ApiTags('checkin')
@Controller('checkin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('scan')
  @ApiOperation({ summary: 'Scan ticket QR code' })
  @ApiResponse({ status: 200, description: 'Ticket scanned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid QR code or already scanned' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async scanTicket(
    @Body() dto: ScanTicketDto,
    @CurrentUser() user: any
  ) {
    return this.checkinService.scanTicket(dto.qrCode, user.userId);
  }
}
