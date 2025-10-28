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

  async seedDatabase() {
    const prisma = this.prisma;
    
    // Check if data already exists
    const existingEvents = await prisma.event.count();
    if (existingEvents > 0) {
      return { message: 'Database already has data. Skipping seed.', exists: true };
    }

    // Create Venue
    const venue = await prisma.venue.create({
      data: {
        name: 'ClubSuite VIP',
        description: 'Premium nightclub in the heart of the city',
        address: '123 Main Street',
        city: 'New York',
        country: 'USA',
        phone: '+1-555-0100',
        email: 'info@clubsuite.com',
        website: 'https://clubsuite.com',
        openingTime: '22:00',
        closingTime: '04:00',
        isActive: true,
      },
    });

    // Create Halls
    const mainHall = await prisma.hall.create({
      data: {
        name: 'Main Dance Floor',
        description: 'Main hall with DJ booth and dance floor',
        capacity: 500,
        venueId: venue.id,
        isActive: true,
      },
    });

    const vipHall = await prisma.hall.create({
      data: {
        name: 'VIP Lounge',
        description: 'Exclusive VIP area with bottle service',
        capacity: 100,
        venueId: venue.id,
        isActive: true,
      },
    });

    // Create Event
    const event = await prisma.event.create({
      data: {
        venueId: venue.id,
        hallId: mainHall.id,
        name: 'VIP Weekend Party',
        description: 'Exclusive Saturday night event with top DJs',
        date: new Date('2025-11-15T22:00:00Z'),
        startTime: new Date('2025-11-15T22:00:00Z'),
        endTime: new Date('2025-11-16T04:00:00Z'),
        status: 'PUBLISHED',
        capacity: 500,
        coverCharge: new Prisma.Decimal(50.00),
        isActive: true,
      },
    });

    // Create Packages
    const package1 = await prisma.package.create({
      data: {
        eventId: event.id,
        name: 'VIP Table Package',
        description: 'VIP table with bottle service for 8 guests',
        price: new Prisma.Decimal(1500.00),
        minGuests: 4,
        maxGuests: 8,
        bottles: [
          { type: 'Vodka', brand: 'Grey Goose', quantity: 1 },
          { type: 'Champagne', brand: 'Dom Perignon', quantity: 1 },
          { type: 'Mixers', items: ['Red Bull', 'Cranberry', 'Soda'], quantity: 1 },
        ],
        amenities: ['VIP Entry', 'Dedicated Server', 'Priority Table Selection'],
        isAvailable: true,
      },
    });

    const package2 = await prisma.package.create({
      data: {
        eventId: event.id,
        name: 'Standard Bottle Service',
        description: 'Basic bottle service package for small groups',
        price: new Prisma.Decimal(800.00),
        minGuests: 2,
        maxGuests: 4,
        bottles: [
          { type: 'Vodka', brand: 'Smirnoff', quantity: 1 },
          { type: 'Mixers', items: ['Cranberry', 'Soda'], quantity: 1 },
        ],
        amenities: ['Standard Entry', 'Shared Table'],
        isAvailable: true,
      },
    });

    // Create Users (including admin)
    const adminUser = await prisma.user.create({
      data: {
        telegramId: 'browser_admin',
        username: 'admin',
        firstName: 'Admin',
        role: 'ADMIN',
        isActive: true,
      },
    });

    const regularUsers = await prisma.user.createMany({
      data: [
        { telegramId: 'telegram_1', firstName: 'John', lastName: 'Doe', username: 'john', role: 'USER', isActive: true },
        { telegramId: 'telegram_2', firstName: 'Jane', lastName: 'Smith', username: 'jane', role: 'USER', isActive: true },
        { telegramId: 'telegram_3', firstName: 'Bob', lastName: 'Johnson', username: 'bob', role: 'VIP', isActive: true },
      ],
    });

    return {
      message: 'Database seeded successfully',
      data: {
        venue: { id: venue.id, name: venue.name },
        halls: [{ id: mainHall.id, name: mainHall.name }, { id: vipHall.id, name: vipHall.name }],
        event: { id: event.id, name: event.name },
        packages: [
          { id: package1.id, name: package1.name },
          { id: package2.id, name: package2.name },
        ],
        users: { admin: { id: adminUser.id, username: adminUser.username } },
      },
    };
  }

  async getAllEvents() {
    return this.prisma.event.findMany({
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
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}
