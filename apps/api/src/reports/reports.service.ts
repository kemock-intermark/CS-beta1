import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [users, events, reservations, tickets, payments, checkins] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.event.count({ where }),
      this.prisma.reservation.count({ where }),
      this.prisma.ticket.count({ where }),
      this.prisma.payment.count({ where }),
      this.prisma.checkin.count({ where }),
    ]);

    const totalRevenue = await this.prisma.payment.aggregate({
      where: {
        ...where,
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });

    const confirmedReservations = await this.prisma.reservation.count({
      where: {
        ...where,
        status: 'CONFIRMED',
      },
    });

    const checkedInReservations = await this.prisma.reservation.count({
      where: {
        ...where,
        status: 'CHECKED_IN',
      },
    });

    return {
      summary: {
        totalUsers: users,
        totalEvents: events,
        totalReservations: reservations,
        confirmedReservations,
        checkedInReservations,
        totalTickets: tickets,
        totalCheckins: checkins,
        totalPayments: payments,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
      },
      metrics: {
        reservationConfirmationRate: reservations > 0 ? (confirmedReservations / reservations) * 100 : 0,
        checkinRate: reservations > 0 ? (checkedInReservations / reservations) * 100 : 0,
        averageTicketValue: tickets > 0 ? Number(totalRevenue._sum.amount || 0) / tickets : 0,
      },
      period: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    };
  }
}
