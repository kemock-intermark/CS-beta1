import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PromotersService {
  constructor(private readonly prisma: PrismaService) {}

  async createLead(promoterUserId: string, dto: CreateLeadDto) {
    // TODO: Fix promoter lookup - Promoter model is not linked to User
    // For now, find by ID directly
    const promoter = await this.prisma.promoter.findUnique({
      where: {
        id: promoterUserId,
      },
    });

    if (!promoter) {
      throw new NotFoundException('Promoter not found');
    }

    // Create or find user
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: dto.phone },
          { email: dto.email },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: uuidv4(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          role: 'USER',
          isActive: true,
        },
      });
    }

    // Create guest profile if doesn't exist
    let guestProfile = await this.prisma.guestProfile.findUnique({
      where: { userId: user.id },
    });

    if (!guestProfile) {
      guestProfile = await this.prisma.guestProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    return {
      user,
      promoterCode: promoter.code,
    };
  }

  async getPromoterKPI(promoterUserId: string) {
    // TODO: Fix promoter lookup - Promoter model is not linked to User
    const promoter = await this.prisma.promoter.findUnique({
      where: {
        id: promoterUserId,
      },
      include: {
        promoterAttribs: {
          include: {
            reservation: true,
          },
        },
      },
    });

    if (!promoter) {
      throw new NotFoundException('Promoter not found');
    }

    const totalReservations = promoter.promoterAttribs.length;
    const confirmedReservations = promoter.promoterAttribs.filter(
      (p: any) => p.reservation.status === 'CONFIRMED'
    ).length;
    const totalCommission = promoter.promoterAttribs.reduce((sum: number, p: any) => sum + Number(p.commission), 0);
    const paidCommission = promoter.promoterAttribs
      .filter((p: any) => p.paid)
      .reduce((sum: number, p: any) => sum + Number(p.commission), 0);

    return {
      promoter: {
        name: promoter.name,
        code: promoter.code,
        commission: Number(promoter.commission),
      },
      kpi: {
        totalReservations,
        confirmedReservations,
        conversionRate: totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0,
        totalCommission,
        paidCommission,
        pendingCommission: totalCommission - paidCommission,
      },
    };
  }
}
