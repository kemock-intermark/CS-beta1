import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveEvents(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {
      isActive: true,
      status: filters?.status || 'PUBLISHED',
    };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    return this.prisma.event.findMany({
      where,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        hall: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        packages: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            price: true,
            minGuests: true,
            maxGuests: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getEventById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        hall: true,
        packages: {
          where: { isAvailable: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async getActivePackages(eventId?: string) {
    const where: any = {
      isAvailable: true,
    };

    if (eventId) {
      where.eventId = eventId;
      where.event = {
        isActive: true,
        status: 'PUBLISHED',
      };
    }

    return this.prisma.package.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  async getPackageById(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            venue: true,
            hall: true,
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return pkg;
  }

  async createEvent(dto: {
    venueId: string;
    hallId?: string;
    name: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity?: number;
    coverCharge?: string;
  }) {
    const event = await this.prisma.event.create({
      data: {
        venueId: dto.venueId,
        hallId: dto.hallId || null,
        name: dto.name,
        description: dto.description,
        date: new Date(dto.date),
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        capacity: dto.capacity,
        coverCharge: dto.coverCharge ? new Prisma.Decimal(dto.coverCharge) : null,
        status: 'PUBLISHED',
        isActive: true,
      },
    });
    return event;
  }

  async createPackage(dto: {
    eventId: string;
    name: string;
    description?: string;
    price: string;
    minGuests?: number;
    maxGuests?: number;
    bottles?: any;
    amenities?: any;
  }) {
    const pkg = await this.prisma.package.create({
      data: {
        eventId: dto.eventId,
        name: dto.name,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        minGuests: dto.minGuests,
        maxGuests: dto.maxGuests,
        bottles: dto.bottles,
        amenities: dto.amenities,
        isAvailable: true,
      },
    });
    return pkg;
  }
}
