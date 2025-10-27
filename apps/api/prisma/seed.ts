import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database
  console.log('🗑️  Cleaning database...');
  await prisma.messageLog.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.promoterAttribution.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.package.deleteMany();
  await prisma.event.deleteMany();
  await prisma.table.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.promoter.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.guestProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create Venue
  console.log('🏢 Creating venue...');
  const venue = await prisma.venue.create({
    data: {
      name: 'ClubSuite VIP',
      description: 'Premium nightclub in the heart of the city',
      address: '123 Main Street',
      city: 'New York',
      country: 'USA',
      phone: '+1-555-0100',
      email: 'info@clubsuitep.com',
      website: 'https://clubsuitep.com',
      openingTime: '22:00',
      closingTime: '04:00',
      isActive: true,
    },
  });

  console.log('✅ Venue created:', venue.name);

  // Create Halls
  console.log('🏛️  Creating halls...');
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

  console.log('✅ Created 2 halls');

  // Create Tables
  console.log('🪑 Creating tables...');
  const tables = [
    {
      name: 'VIP Table 1',
      description: 'Premium table near DJ booth',
      capacity: 8,
      minPurchase: 1500,
      hallId: mainHall.id,
      position: 'Near DJ booth',
      status: 'AVAILABLE' as const,
    },
    {
      name: 'VIP Table 2',
      description: 'Corner table with great view',
      capacity: 6,
      minPurchase: 1200,
      hallId: mainHall.id,
      position: 'Corner',
      status: 'AVAILABLE' as const,
    },
    {
      name: 'VIP Table 3',
      description: 'Elevated table',
      capacity: 4,
      minPurchase: 800,
      hallId: vipHall.id,
      position: 'Elevated area',
      status: 'AVAILABLE' as const,
    },
    {
      name: 'Booth 1',
      description: 'Intimate booth for couples',
      capacity: 2,
      minPurchase: 500,
      hallId: vipHall.id,
      position: 'Back corner',
      status: 'AVAILABLE' as const,
    },
    {
      name: 'Booth 2',
      description: 'Premium booth with bottle service',
      capacity: 6,
      minPurchase: 1000,
      hallId: vipHall.id,
      position: 'Side area',
      status: 'RESERVED' as const,
    },
  ];

  for (const table of tables) {
    await prisma.table.create({ data: table });
  }

  console.log('✅ Created 5 tables');

  // Create Users
  console.log('👥 Creating users...');
  const users = [];

  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        telegramId: `telegram_${i}`,
        firstName: `User${i}`,
        lastName: `LastName${i}`,
        username: `user${i}`,
        phone: `+1-555-000${i}`,
        email: `user${i}@example.com`,
        role: i === 1 ? 'ADMIN' : i <= 3 ? 'VIP' : 'USER',
        isActive: true,
      },
    });

    // Create Guest Profile for some users
    if (i <= 5) {
      await prisma.guestProfile.create({
        data: {
          userId: user.id,
          visitCount: i * 2,
          totalSpent: i * 500,
          preferences: {
            preferredTableType: i <= 3 ? 'VIP' : 'Standard',
            musicGenre: ['House', 'EDM'],
          },
        },
      });
    }

    users.push(user);
  }

  console.log('✅ Created 10 users with 5 guest profiles');

  // Create Promoter
  console.log('📢 Creating promoter...');
  const promoter = await prisma.promoter.create({
    data: {
      venueId: venue.id,
      name: 'John Promoter',
      code: 'JOHN001',
      phone: '+1-555-0200',
      email: 'john@promotion.com',
      commission: 15.0,
      isActive: true,
    },
  });

  console.log('✅ Promoter created:', promoter.code);

  // Create Event
  console.log('🎉 Creating event...');
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 7); // 7 days from now
  eventDate.setHours(22, 0, 0, 0);

  const startTime = new Date(eventDate);
  const endTime = new Date(eventDate);
  endTime.setHours(4, 0, 0, 0);
  endTime.setDate(endTime.getDate() + 1);

  const event = await prisma.event.create({
    data: {
      name: 'VIP Weekend Party',
      description: 'Exclusive Saturday night event with top DJs',
      date: eventDate,
      startTime: startTime,
      endTime: endTime,
      venueId: venue.id,
      hallId: mainHall.id,
      capacity: 500,
      coverCharge: 50,
      status: 'PUBLISHED',
      isActive: true,
      metadata: {
        dj: 'DJ Example',
        dressCode: 'Upscale',
        ageRestriction: 21,
      },
    },
  });

  console.log('✅ Event created:', event.name);

  // Create Packages (Bottle Service)
  console.log('🍾 Creating packages...');
  const package1 = await prisma.package.create({
    data: {
      eventId: event.id,
      name: 'Premium Bottle Service',
      description: 'Premium spirits package for VIP tables',
      price: 1500,
      bottles: {
        vodka: ['Grey Goose', 'Belvedere'],
        whiskey: ['Macallan 18'],
        champagne: ['Dom Pérignon'],
      },
      amenities: ['Mixers', 'Ice', 'VIP Host', 'Bottle Girls'],
      minGuests: 4,
      maxGuests: 8,
      isAvailable: true,
    },
  });

  const package2 = await prisma.package.create({
    data: {
      eventId: event.id,
      name: 'Deluxe Bottle Service',
      description: 'Ultra-premium spirits package',
      price: 2500,
      bottles: {
        vodka: ['Dom Perignon Vintage', 'Ace of Spades'],
        whiskey: ['Johnnie Walker Blue'],
        champagne: ['Louis XIII'],
      },
      amenities: [
        'Premium Mixers',
        'Private Bar Setup',
        'Dedicated VIP Host',
        'Bottle Girls',
        'Sparkler Service',
      ],
      minGuests: 6,
      maxGuests: 12,
      isAvailable: true,
    },
  });

  console.log('✅ Created 2 bottle service packages');

  // Create Sample Reservations
  console.log('📅 Creating sample reservations...');
  const reservation1 = await prisma.reservation.create({
    data: {
      userId: users[0].id,
      eventId: event.id,
      tableId: tables[0].id,
      packageId: package1.id,
      guestCount: 6,
      status: 'CONFIRMED',
      reservationDate: startTime,
      notes: 'Birthday celebration',
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      userId: users[1].id,
      eventId: event.id,
      tableId: tables[1].id,
      packageId: package2.id,
      guestCount: 8,
      status: 'CONFIRMED',
      reservationDate: startTime,
    },
  });

  console.log('✅ Created 2 reservations');

  // Create Tickets
  console.log('🎟️  Creating tickets...');
  const ticket1 = await prisma.ticket.create({
    data: {
      userId: users[2].id,
      eventId: event.id,
      reservationId: null,
      type: 'General Admission',
      price: 50,
      qrCode: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isScanned: false,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      userId: users[3].id,
      eventId: event.id,
      type: 'VIP Ticket',
      price: 150,
      qrCode: `TICKET-VIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isScanned: false,
    },
  });

  console.log('✅ Created 2 tickets');

  // Create Waitlist Entry
  console.log('📝 Creating waitlist entry...');
  await prisma.waitlistEntry.create({
    data: {
      userId: users[4].id,
      eventId: event.id,
      tableId: tables[3].id,
      priority: 1,
      status: 'PENDING',
    },
  });

  console.log('✅ Created waitlist entry');

  // Create Payment
  console.log('💳 Creating payment...');
  await prisma.payment.create({
    data: {
      userId: users[0].id,
      reservationId: reservation1.id,
      amount: 1500,
      currency: 'USD',
      status: 'PAID',
      paymentMethod: 'Telegram Payments',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
  });

  console.log('✅ Created payment');

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  - 1 Venue');
  console.log('  - 2 Halls');
  console.log('  - 5 Tables');
  console.log('  - 1 Event');
  console.log('  - 2 Packages (Bottle Service)');
  console.log('  - 10 Users (5 with Guest Profiles)');
  console.log('  - 1 Promoter');
  console.log('  - 2 Reservations');
  console.log('  - 2 Tickets');
  console.log('  - 1 Waitlist Entry');
  console.log('  - 1 Payment');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
