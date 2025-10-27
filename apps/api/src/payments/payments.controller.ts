import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('telegram/invoice')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create invoice for payment' })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  async createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.paymentsService.createInvoice(user.userId, dto);
  }

  @Post('telegram/callback')
  @ApiOperation({ summary: 'Payment webhook callback' })
  @ApiResponse({ status: 200, description: 'Payment processed' })
  async paymentCallback(@Body() payload: any) {
    return this.paymentsService.processPaymentCallback(payload);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's payments" })
  @ApiResponse({ status: 200, description: 'List of payments' })
  async getUserPayments(@CurrentUser() user: any) {
    return this.paymentsService.getUserPayments(user.userId);
  }
}
