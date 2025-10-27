import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { v4 as uuidv4 } from 'uuid';
import { QRGenerator } from '../utils/qr-generator.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async purchaseTicket(userId: string, dto: CreateTicketDto) {
    // Check if event exists and is available
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event is not available for ticket purchase');
    }

    // Determine ticket price based on type
    let price = event.coverCharge ? Number(event.coverCharge) : 0;
    if (dto.type === 'VIP') {
      price = event.coverCharge ? Number(event.coverCharge) * 2 : 100;
    }

    // Create ticket first
    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        eventId: dto.eventId,
        type: dto.type,
        price: price.toString(),
        qrCode: uuidv4(), // Store unique ID for QR
        isScanned: false,
      },
      include: {
        event: {
          include: {
            venue: true,
            hall: true,
          },
        },
      },
    });

    // Generate QR code with signature
    const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    const qrCode = await QRGenerator.generateTicketQR(
      ticket.id,
      userId,
      dto.eventId,
      secret
    );

    return {
      ...ticket,
      qrCodeImage: qrCode,
    };
  }

  async getUserTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            venue: true,
            hall: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async scanTicket(qrCode: string, _scannerId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Invalid QR code');
    }

    if (ticket.isScanned) {
      throw new BadRequestException('Ticket already scanned');
    }

    // Mark ticket as scanned
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isScanned: true,
        scannedAt: new Date(),
      },
    });

    // Create checkin record
    await this.prisma.checkin.create({
      data: {
        userId: ticket.userId,
        eventId: ticket.eventId,
        ticketId: ticket.id,
      },
    });

    return ticket;
  }
}
