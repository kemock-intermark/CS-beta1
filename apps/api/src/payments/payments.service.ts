import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async createInvoice(userId: string, dto: CreateInvoiceDto) {
    const PAYMENT_PROVIDER_TOKEN = this.configService.get<string>('TELEGRAM_PAYMENT_PROVIDER_TOKEN');

    if (!PAYMENT_PROVIDER_TOKEN) {
      throw new BadRequestException('Payment provider not configured');
    }

    // Create payment record
    const transactionId = uuidv4();
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        reservationId: dto.reservationId,
        amount: dto.amount.toString(),
        currency: dto.currency,
        status: 'PENDING',
        transactionId,
      },
    });

    // In production, this would create a real invoice with Telegram
    // For now, return mock invoice data
    return {
      invoiceUrl: `https://t.me/{$PAYMENT_PROVIDER_TOKEN}/invoice?invoice_id=${transactionId}`,
      paymentId: payment.id,
      transactionId,
      amount: dto.amount,
      currency: dto.currency,
    };
  }

  async processPaymentCallback(payload: any) {
    // Process Telegram payment callback
    const { transaction_id, status } = payload;

    if (!transaction_id) {
      throw new BadRequestException('Transaction ID is required');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { transactionId: transaction_id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    let paymentStatus = 'PENDING';
    if (status === 'success') {
      paymentStatus = 'PAID';
    } else if (status === 'failed') {
      paymentStatus = 'FAILED';
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus as PaymentStatus,
      },
    });

    // Update reservation if exists
    if (payment.reservationId && paymentStatus === 'PAID') {
      await this.prisma.reservation.update({
        where: { id: payment.reservationId },
        data: { status: 'CONFIRMED' },
      });
    }

    return { success: true };
  }

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
