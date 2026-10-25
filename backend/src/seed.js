require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Ride = require('./models/Ride');
const Booking = require('./models/Booking');
const Notification = require('./models/Notification');
const Report = require('./models/Report');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

async function seedData(shouldDisconnect = true) {
  console.log('[Seed] Starting database seed for CampusPool (KIET Group of Institutions)...');
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Ride.deleteMany({}),
    Booking.deleteMany({}),
    Notification.deleteMany({}),
    Report.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing records.');

  // Create demo KIET students and admin
  const defaultPassword = 'Password@123';

  const admin = await User.create({
    name: 'KIET Campus Admin',
    rollNumber: 'ADMIN-KIET-01',
    email: 'admin@kiet.edu',
    password: defaultPassword,
    course: 'Administration',
    year: 'Faculty & Student Welfare',
    role: 'admin',
    emailVerified: true,
    studentIdStatus: 'verified',
    bio: 'CampusPool Administrator & Student Verification Coordinator at KIET.',
  });

  const studentRahul = await User.create({
    name: 'Rahul Sharma',
    rollNumber: '2200270100045',
    email: 'rahul.sharma@kiet.edu',
    password: defaultPassword,
    course: 'B.Tech Computer Science',
    year: '3rd Year',
    phone: '9876543210',
    role: 'student',
    emailVerified: true,
    studentIdStatus: 'verified',
    bio: 'Day scholar commuting towards Ghaziabad station every Friday evening.',
  });

  const studentPriya = await User.create({
    name: 'Priya Verma',
    rollNumber: '2200270100089',
    email: 'priya.verma@kiet.edu',
    password: defaultPassword,
    course: 'B.Tech Information Technology',
    year: '3rd Year',
    phone: '9876543211',
    role: 'student',
    emailVerified: true,
    studentIdStatus: 'verified',
    bio: 'Hosteler visiting home in East Delhi over the weekend.',
  });

  const studentAman = await User.create({
    name: 'Aman Gupta',
    rollNumber: '2300270100012',
    email: 'aman.gupta@kiet.edu',
    password: defaultPassword,
    course: 'B.Tech Electronics & Comm.',
    year: '2nd Year',
    phone: '9876543212',
    role: 'student',
    emailVerified: true,
    studentIdStatus: 'pending',
    bio: 'Looking to share cabs to Anand Vihar and New Delhi Station.',
  });

  console.log('[Seed] Created 4 verified KIET users (including 1 Admin).');

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  // Create demo rides
  const ride1 = await Ride.create({
    creator: studentRahul._id,
    startLocation: 'KIET Main Gate (NH-58)',
    destination: 'Ghaziabad Railway Station (GZB)',
    campusPickupPoint: 'Outside Main Security Booth, Gate 1',
    travelDate: tomorrowStr,
    departureTime: '17:30',
    totalSeats: 3,
    availableSeats: 2, // 1 seat booked by Aman
    totalEstimatedCost: 300,
    farePerPassenger: 100,
    rideType: 'auto_rickshaw',
    notes: 'Sharing an auto from college gate straight to PF-1 side. Please be on time at 5:25 PM.',
    status: 'active',
  });

  const booking1 = await Booking.create({
    ride: ride1._id,
    passenger: studentAman._id,
    seatsBooked: 1,
    farePerSeat: 100,
    totalFare: 100,
    pickupNotes: 'I will be at the gate right after my lab at 5:20 PM.',
    status: 'confirmed',
  });

  ride1.passengers.push({
    user: studentAman._id,
    booking: booking1._id,
    seatsBooked: 1,
    joinedAt: new Date(),
  });
  await ride1.save();

  // Create initial private conversation between Rahul (host) and Aman (confirmed passenger)
  const conversation1 = await Conversation.create({
    ride: ride1._id,
    creator: studentRahul._id,
    passenger: studentAman._id,
    booking: booking1._id,
    status: 'active',
  });

  const msg1 = await Message.create({
    conversation: conversation1._id,
    sender: studentRahul._id,
    text: "Hey Aman! I am standing outside the main college gate near Gate 1 security booth.",
    type: 'pickup_location',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  });

  const msg2 = await Message.create({
    conversation: conversation1._id,
    sender: studentAman._id,
    text: "Got it Rahul! I am near the security booth now. I will reach you in 3 minutes.",
    type: 'eta',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  });

  const msg3 = await Message.create({
    conversation: conversation1._id,
    sender: studentRahul._id,
    text: "Okay, I will wait near the gate entrance. Auto is waiting.",
    type: 'text',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  });

  conversation1.lastMessage = {
    text: msg3.text,
    sender: studentRahul._id,
    createdAt: msg3.createdAt,
    isRead: false,
  };
  await conversation1.save();

  const ride2 = await Ride.create({
    creator: studentPriya._id,
    startLocation: 'KIET Girls Hostel Block C',
    destination: 'Anand Vihar ISBT / Metro Station',
    campusPickupPoint: 'Cafeteria Parking Area',
    travelDate: tomorrowStr,
    departureTime: '16:00',
    totalSeats: 3,
    availableSeats: 3,
    totalEstimatedCost: 600,
    farePerPassenger: 200,
    rideType: 'cab_share',
    womenOnly: true,
    coRiderPreference: 'women_focused',
    notes: 'Booking a Prime cab for 3 students. Carrying small trolley bag each. Women co-riders preferred.',
    status: 'active',
  });

  const ride3 = await Ride.create({
    creator: studentRahul._id,
    startLocation: 'KIET Campus, Gate 2',
    destination: 'New Delhi Railway Station (NDLS)',
    campusPickupPoint: 'Near Library Fountain',
    travelDate: dayAfterStr,
    departureTime: '06:30',
    totalSeats: 3,
    availableSeats: 3,
    totalEstimatedCost: 900,
    farePerPassenger: 300,
    rideType: 'cab_share',
    notes: 'Catching the 9:15 AM Shatabdi Express. Early morning cab share.',
    status: 'active',
  });

  const ride4 = await Ride.create({
    creator: studentAman._id,
    startLocation: 'KIET Main Gate',
    destination: 'Vaishali Metro Station (Blue Line)',
    campusPickupPoint: 'Main Gate Bus Bay',
    travelDate: tomorrowStr,
    departureTime: '18:15',
    totalSeats: 2,
    availableSeats: 2,
    totalEstimatedCost: 240,
    farePerPassenger: 120,
    rideType: 'auto_rickshaw',
    notes: 'Shared auto to Vaishali Metro station. Quick commute towards Delhi.',
    status: 'active',
  });

  const ride5 = await Ride.create({
    creator: studentPriya._id,
    startLocation: 'KIET Campus',
    destination: 'IGI Airport Terminal 3 (DEL)',
    campusPickupPoint: 'Administrative Block Circle',
    travelDate: dayAfterStr,
    departureTime: '13:00',
    totalSeats: 3,
    availableSeats: 3,
    totalEstimatedCost: 1200,
    farePerPassenger: 400,
    rideType: 'cab_share',
    notes: 'Heading for semester break flight. Room for luggage in boot.',
    status: 'active',
  });

  // Create welcome notifications
  await Notification.create({
    user: studentRahul._id,
    title: 'Welcome to CampusPool!',
    message: 'Welcome to CampusPool at KIET. You can offer rides or discover rides created by fellow students.',
    type: 'system',
  });

  await Notification.create({
    user: studentRahul._id,
    title: 'New Passenger Joined!',
    message: `${studentAman.name} booked 1 seat for your trip to Ghaziabad Railway Station.`,
    type: 'passenger_joined',
    relatedRide: ride1._id,
  });

  // Create a sample demo report for admin panel
  await Report.create({
    reportedBy: studentPriya._id,
    reportedRide: ride1._id,
    reportedUser: studentRahul._id,
    category: 'misleading_ride_info',
    reason: 'misleading_ride_info',
    description: 'Fare estimate verification request for testing reporting flow.',
    supportingNotes: 'Report submitted through private ride report modal.',
    status: 'pending',
  });

  console.log('[Seed] Database successfully populated with realistic KIET demo data.');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials for Testing:');
  console.log('Student 1: rahul.sharma@kiet.edu | Password: Password@123');
  console.log('Student 2: priya.verma@kiet.edu  | Password: Password@123');
  console.log('Student 3: aman.gupta@kiet.edu   | Password: Password@123');
  console.log('Admin:     admin@kiet.edu        | Password: Password@123');
  console.log('----------------------------------------------------');

  if (shouldDisconnect) {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

module.exports = seedData;
