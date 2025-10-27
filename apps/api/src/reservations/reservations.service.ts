import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReservation(userId: string, dto: CreateReservationDto) {
    // Validate event, package, or table exists
    if (dto.eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: dto.eventId },
      });
      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
      }
      if (event.status !== 'PUBLISHED') {
        throw new BadRequestException('Event is not available for reservations');
      }
    }

    if (dto.tableId) {
      const table = await this.prisma.table.findUnique({
        where: { id: dto.tableId },
      });
      if (!table) {
        throw new NotFoundException(`Table with ID ${dto.tableId} not found`);
      }
      if (table.status !== 'AVAILABLE') {
        throw new BadRequestException('Table is not available');
      }
    }

    if (dto.packageId) {
      const pkg = await this.prisma.package.findUnique({
        where: { id: dto.packageId },
      });
      if (!pkg) {
        throw new NotFoundException(`Package with ID ${dto.packageId} not found`);
      }
      if (!pkg.isAvailable) {
        throw new BadRequestException('Package is not available');
      }
    }

    // Create reservation
    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        eventId: dto.eventId,
        tableId: dto.tableId,
        packageId: dto.packageId,
        guestCount: dto.guestCount,
        reservationDate: new Date(dto.reservationDate),
        status: 'PENDING',
        notes: dto.notes,
      },
      include: {
        event: true,
        table: true,
        package: true,
      },
    });

    return reservation;
  }

  async getUserReservations(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        event: true,
        table: true,
        package: true,
      },
      orderBy: {
        reservationDate: 'desc',
      },
    });
  }

  async getReservationById(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            venue: true,
            hall: true,
          },
        },
        table: true,
        package: true,
        user: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return reservation;
  }

  async cancelReservation(id: string, userId: string) {
    const reservation = await this.getReservationById(id, userId);

    if (reservation.status === 'CANCELLED') {
      throw new BadRequestException('Reservation is already cancelled');
    }

    if (reservation.status === 'CHECKED_IN' || reservation.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed reservation');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }
}
