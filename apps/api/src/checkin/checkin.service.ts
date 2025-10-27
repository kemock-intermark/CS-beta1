import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckinService {
  constructor(private readonly prisma: PrismaService) {}

  async scanTicket(qrCode: string, scannerId: string) {
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
    const checkin = await this.prisma.checkin.create({
      data: {
        userId: ticket.userId,
        eventId: ticket.eventId,
        ticketId: ticket.id,
      },
    });

    // Update event checkins count if needed
    await this.prisma.event.update({
      where: { id: ticket.eventId },
      data: {
        // Update event metadata or statistics
      },
    });

    return {
      checkin,
      ticket: {
        ...ticket,
        isScanned: true,
      },
    };
  }
}
