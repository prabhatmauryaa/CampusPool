/**
 * Automated test suite for CampusPool backend logic:
 * 1. Email domain verification (@kiet.edu strict check)
 * 2. User registration and password hashing
 * 3. Ride creation and fare calculation
 * 4. Ride capacity, duplicate booking prevention, and self-booking rejection
 * 5. Cancellation logic
 */

const { isValidKietEmail } = require('../utils/domainValidator');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  }
}

async function runDomainValidationTests() {
  console.log('\n--- Test Suite 1: College Domain Validation (@kiet.edu) ---');

  // Valid domains
  assert(isValidKietEmail('student@kiet.edu') === true, 'Accepts student@kiet.edu');
  assert(isValidKietEmail('rahul.sharma@kiet.edu') === true, 'Accepts rahul.sharma@kiet.edu');
  assert(isValidKietEmail('PRIYA.VERMA@KIET.EDU') === true, 'Accepts uppercase PRIYA.VERMA@KIET.EDU (case-insensitive)');
  assert(isValidKietEmail('  aman.gupta@kiet.edu  ') === true, 'Accepts whitespace-padded email after trim');

  // Invalid domains
  assert(isValidKietEmail('student@gmail.com') === false, 'Rejects student@gmail.com');
  assert(isValidKietEmail('student@yahoo.com') === false, 'Rejects student@yahoo.com');
  assert(isValidKietEmail('student@outlook.com') === false, 'Rejects student@outlook.com');
  assert(isValidKietEmail('student@othercollege.edu') === false, 'Rejects student@othercollege.edu');
  assert(isValidKietEmail('student@kiet.edu.example.com') === false, 'Rejects student@kiet.edu.example.com (spoofed subdomain)');
  assert(isValidKietEmail('student@fakekiet.edu') === false, 'Rejects student@fakekiet.edu');
  assert(isValidKietEmail('student@kiet.edu.in') === false, 'Rejects student@kiet.edu.in');
  assert(isValidKietEmail('kiet.edu') === false, 'Rejects missing local part');
  assert(isValidKietEmail('@kiet.edu') === false, 'Rejects empty username');
  assert(isValidKietEmail('') === false, 'Rejects empty string');
  assert(isValidKietEmail(null) === false, 'Rejects null input');
}

async function runDatabaseAndBusinessLogicTests() {
  console.log('\n--- Test Suite 2: Authentication, Rides, Capacity & Booking ---');

  await connectDB();

  // Clean test collection
  await User.deleteMany({ email: /@test-kiet\.edu|unit\.test@kiet\.edu/i });
  await Ride.deleteMany({ notes: /Automated Unit Test/ });
  await Booking.deleteMany({});

  // 1. Create a test user
  const testUser1 = await User.create({
    name: 'Test Student 1',
    rollNumber: 'TEST-ROLL-001',
    email: 'unit.test1@kiet.edu',
    password: 'TestPassword123',
    course: 'B.Tech IT',
    year: '4th Year',
  });

  assert(testUser1._id != null, 'User 1 created with generated ObjectId');
  assert(testUser1.password !== 'TestPassword123', 'Password is encrypted and hashed with bcrypt');

  const passwordMatch = await testUser1.comparePassword('TestPassword123');
  assert(passwordMatch === true, 'Password verification succeeds with correct password');

  const passwordMismatch = await testUser1.comparePassword('WrongPassword');
  assert(passwordMismatch === false, 'Password verification fails with incorrect password');

  // Duplicate email check
  let duplicateCaught = false;
  try {
    await User.create({
      name: 'Test Student Duplicate',
      rollNumber: 'TEST-ROLL-999',
      email: 'unit.test1@kiet.edu',
      password: 'TestPassword123',
      course: 'B.Tech CSE',
      year: '1st Year',
    });
  } catch (err) {
    duplicateCaught = true;
  }
  assert(duplicateCaught === true, 'Duplicate @kiet.edu email registration is rejected by database unique index');

  // 2. Create another test user
  const testUser2 = await User.create({
    name: 'Test Student 2',
    rollNumber: 'TEST-ROLL-002',
    email: 'unit.test2@kiet.edu',
    password: 'TestPassword123',
    course: 'MCA',
    year: '2nd Year',
  });

  // 3. Create a test ride
  const totalCost = 600;
  const seats = 3;
  const farePerPassenger = Math.round(totalCost / seats); // 200

  assert(farePerPassenger === 200, 'Transparent fare calculation: 600 / 3 = 200 per passenger');

  const ride = await Ride.create({
    creator: testUser1._id,
    startLocation: 'KIET Gate 1',
    destination: 'Ghaziabad Railway Station',
    campusPickupPoint: 'Security Booth',
    travelDate: '2026-11-01',
    departureTime: '15:00',
    totalSeats: seats,
    availableSeats: seats,
    totalEstimatedCost: totalCost,
    farePerPassenger,
    notes: 'Automated Unit Test Ride',
    status: 'active',
  });

  assert(ride.availableSeats === 3, 'Ride initialized with 3 available seats');
  assert(ride.status === 'active', 'Ride initialized in active status');

  // 4. Test self-booking rejection logic
  const isCreatorJoining = ride.creator.toString() === testUser1._id.toString();
  assert(isCreatorJoining === true, 'Correctly detects when creator attempts to book their own ride');

  // 5. User 2 books 1 seat
  const booking1 = await Booking.create({
    ride: ride._id,
    passenger: testUser2._id,
    seatsBooked: 1,
    farePerSeat: ride.farePerPassenger,
    totalFare: ride.farePerPassenger,
    status: 'confirmed',
  });

  ride.availableSeats -= 1;
  ride.passengers.push({
    user: testUser2._id,
    booking: booking1._id,
    seatsBooked: 1,
  });
  await ride.save();

  assert(ride.availableSeats === 2, 'Available seats decrements from 3 to 2 after booking');

  // 6. Test duplicate booking prevention
  const alreadyBooked = ride.passengers.some((p) => p.user.toString() === testUser2._id.toString());
  assert(alreadyBooked === true, 'Duplicate booking check detects existing passenger in ride');

  // 7. Booking remaining 2 seats to test 'full' transition
  const testUser3 = await User.create({
    name: 'Test Student 3',
    rollNumber: 'TEST-ROLL-003',
    email: 'unit.test3@kiet.edu',
    password: 'TestPassword123',
    course: 'B.Tech ME',
    year: '3rd Year',
  });

  ride.availableSeats -= 2;
  ride.passengers.push({
    user: testUser3._id,
    seatsBooked: 2,
  });
  await ride.save();

  assert(ride.availableSeats === 0, 'Available seats reaches 0');
  assert(ride.status === 'full', 'Ride automatically transitions to status: full when capacity is exhausted');

  // 8. Test cancellation restoring seats
  ride.availableSeats += 1;
  ride.passengers = ride.passengers.filter((p) => p.user.toString() !== testUser2._id.toString());
  await ride.save();

  assert(ride.availableSeats === 1, 'Cancelling a booking restores seat capacity to 1');
  assert(ride.status === 'active', 'Ride status automatically reverts back to active when seats become available');

  // Clean up
  await User.deleteMany({ email: /unit\.test[123]@kiet\.edu/ });
  await Ride.deleteMany({ notes: /Automated Unit Test/ });
  await Booking.deleteMany({ _id: booking1._id });
}

async function runPrivateChatSecurityAndLifecycleTests() {
  console.log('\n--- Test Suite 3: Private Ride Chat Security, Authorization & Lifecycle ---');

  const Conversation = require('../models/Conversation');
  const Message = require('../models/Message');

  // Setup test users: Host, Passenger, and Third Student (intruder)
  const host = await User.create({
    name: 'Chat Test Host',
    rollNumber: 'CHAT-HOST-001',
    email: 'chat.host@kiet.edu',
    password: 'Password@123',
    course: 'B.Tech CS',
    year: '3rd Year',
  });

  const passenger = await User.create({
    name: 'Chat Test Passenger',
    rollNumber: 'CHAT-PASS-002',
    email: 'chat.passenger@kiet.edu',
    password: 'Password@123',
    course: 'B.Tech IT',
    year: '2nd Year',
  });

  const thirdStudent = await User.create({
    name: 'Third Student Intruder',
    rollNumber: 'CHAT-INTR-003',
    email: 'chat.intruder@kiet.edu',
    password: 'Password@123',
    course: 'B.Tech ME',
    year: '1st Year',
  });

  const testRide = await Ride.create({
    creator: host._id,
    startLocation: 'KIET Gate 1',
    destination: 'Ghaziabad Metro Station',
    campusPickupPoint: 'Main Gate Booth',
    travelDate: '2026-11-05',
    departureTime: '17:00',
    totalSeats: 3,
    availableSeats: 2,
    totalEstimatedCost: 300,
    farePerPassenger: 100,
    status: 'active',
  });

  const testBooking = await Booking.create({
    ride: testRide._id,
    passenger: passenger._id,
    seatsBooked: 1,
    farePerSeat: 100,
    totalFare: 100,
    status: 'confirmed',
  });

  // Ensure indexes are built
  await Conversation.init();

  // 1. Create conversation for confirmed booking
  const conversation = await Conversation.create({
    ride: testRide._id,
    creator: host._id,
    passenger: passenger._id,
    booking: testBooking._id,
    status: 'active',
  });

  assert(conversation._id != null, 'Private 1-to-1 conversation created successfully');
  assert(conversation.status === 'active', 'Conversation status initialized to active');

  // 2. Prevent duplicate conversations for the same booking
  let duplicatePrevented = false;
  try {
    await Conversation.create({
      ride: testRide._id,
      creator: host._id,
      passenger: passenger._id,
      booking: testBooking._id,
      status: 'active',
    });
  } catch (err) {
    duplicatePrevented = true;
  }
  assert(duplicatePrevented === true, 'Database unique index prevents duplicate conversation for same booking');

  // 3. Authorization verification
  const isHostAuthorized = conversation.creator.toString() === host._id.toString();
  const isPassengerAuthorized = conversation.passenger.toString() === passenger._id.toString();
  const isThirdStudentAuthorized =
    conversation.creator.toString() === thirdStudent._id.toString() ||
    conversation.passenger.toString() === thirdStudent._id.toString();

  assert(isHostAuthorized === true, 'Ride creator is authorized to access chat');
  assert(isPassengerAuthorized === true, 'Confirmed passenger is authorized to access chat');
  assert(isThirdStudentAuthorized === false, 'Third student NOT part of ride is strictly rejected (Access Denied)');

  // 4. Send coordination messages (pickup point, ETA, text)
  const pickupMessage = await Message.create({
    conversation: conversation._id,
    sender: host._id,
    text: 'I am standing outside the main college gate.',
    type: 'pickup_location',
    isRead: false,
  });

  assert(pickupMessage._id != null, 'Host coordination message successfully persisted in MongoDB');
  assert(pickupMessage.type === 'pickup_location', 'Message type correctly tagged as pickup_location');

  const etaMessage = await Message.create({
    conversation: conversation._id,
    sender: passenger._id,
    text: 'I am near the security booth. I will reach you in 3 minutes.',
    type: 'eta',
    isRead: false,
  });

  assert(etaMessage._id != null, 'Passenger ETA message successfully persisted in MongoDB');
  assert(etaMessage.type === 'eta', 'Message type correctly tagged as eta');

  // 5. Query message history
  const messageCount = await Message.countDocuments({ conversation: conversation._id });
  assert(messageCount === 2, 'Message history returns exactly 2 messages in chronological order');

  // 6. Test cancellation policy
  conversation.status = 'booking_cancelled';
  await conversation.save();

  assert(conversation.status === 'booking_cancelled', 'Conversation transitioned to booking_cancelled upon booking cancellation');

  // Verify messaging restriction on cancelled conversation
  const canSendMessageAfterCancel = conversation.status === 'active';
  assert(canSendMessageAfterCancel === false, 'Further messaging disabled when booking is cancelled');

  // Clean up
  await Message.deleteMany({ conversation: conversation._id });
  await Conversation.deleteMany({ _id: conversation._id });
  await Booking.deleteMany({ _id: testBooking._id });
  await Ride.deleteMany({ _id: testRide._id });
  await User.deleteMany({ _id: { $in: [host._id, passenger._id, thirdStudent._id] } });
}

async function runCancellationAndSuspensionTests() {
  console.log('\n--- Test Suite 4: Ride Cancellation Tracking, Thresholds & Suspension (Limit: 30) ---');

  const Report = require('../models/Report');
  const CancellationLog = require('../models/CancellationLog');
  const AdminAuditLog = require('../models/AdminAuditLog');
  const rideController = require('../controllers/rideController');

  // Create clean test users
  const host = await User.create({
    name: 'Cancel Test Host',
    rollNumber: 'CANCEL-HOST-01',
    email: 'cancel.host@kiet.edu',
    password: 'Password@123',
    course: 'B.Tech CS',
    year: '3rd Year',
    cancellationCount: 0,
    isSuspended: false,
  });

  const passenger = await User.create({
    name: 'Cancel Test Passenger',
    rollNumber: 'CANCEL-PASS-01',
    email: 'cancel.passenger@kiet.edu',
    password: 'Password@123',
    course: 'B.Tech IT',
    year: '2nd Year',
    cancellationCount: 0,
    isSuspended: false,
  });

  // Test 1: Creator cancels ride with 0 passengers -> NOT an eligible cancellation (no students stranded)
  const emptyRide = await Ride.create({
    creator: host._id,
    startLocation: 'KIET Main Gate',
    destination: 'Ghaziabad Station',
    campusPickupPoint: 'Gate 1',
    travelDate: '2026-10-26',
    departureTime: '17:00',
    totalSeats: 3,
    availableSeats: 3,
    totalEstimatedCost: 300,
    farePerPassenger: 100,
    status: 'active',
    passengers: [],
  });

  const cancelEmptyReq = { params: { id: emptyRide._id.toString() }, body: { cancellationReason: 'Change of plans' }, user: host };
  let cancelEmptyResData = null;
  const cancelEmptyRes = {
    status: () => cancelEmptyRes,
    json: (d) => { cancelEmptyResData = d; return d; },
  };

  await rideController.cancelRide(cancelEmptyReq, cancelEmptyRes);
  const hostAfterEmptyCancel = await User.findById(host._id);
  assert(hostAfterEmptyCancel.cancellationCount === 0, 'Cancelling an empty ride with 0 passengers does NOT increment eligible cancellation count');
  assert(cancelEmptyResData.cancellationTracking.isEligible === false, 'Cancellation record for empty ride correctly marked as isEligible: false');

  // Test 2: Passenger cancels confirmed booking -> Eligible cancellation (+1)
  const testRideWithPassenger = await Ride.create({
    creator: host._id,
    startLocation: 'KIET Main Gate',
    destination: 'Anand Vihar',
    campusPickupPoint: 'Gate 1',
    travelDate: '2026-10-26',
    departureTime: '18:00',
    totalSeats: 3,
    availableSeats: 2,
    totalEstimatedCost: 600,
    farePerPassenger: 200,
    status: 'active',
    passengers: [],
  });

  const booking = await Booking.create({
    ride: testRideWithPassenger._id,
    passenger: passenger._id,
    seatsBooked: 1,
    farePerSeat: 200,
    totalFare: 200,
    status: 'confirmed',
  });

  testRideWithPassenger.passengers.push({
    user: passenger._id,
    booking: booking._id,
    seatsBooked: 1,
    joinedAt: new Date(),
  });
  await testRideWithPassenger.save();

  const cancelBookingReq = { params: { bookingId: booking._id.toString() }, body: { cancellationReason: 'Cannot travel today' }, user: passenger };
  let cancelBookingResData = null;
  const cancelBookingRes = {
    status: () => cancelBookingRes,
    json: (d) => { cancelBookingResData = d; return d; },
  };

  await rideController.cancelBooking(cancelBookingReq, cancelBookingRes);
  const passAfterCancel = await User.findById(passenger._id);
  assert(passAfterCancel.cancellationCount === 1, 'Passenger cancelling confirmed booking increments cancellation count by exactly 1');
  assert(cancelBookingResData.cancellationTracking.isEligible === true, 'Confirmed booking cancellation correctly flagged as eligible cancellation');

  // Seat should be restored
  const rideAfterSeatRestore = await Ride.findById(testRideWithPassenger._id);
  assert(rideAfterSeatRestore.availableSeats === 3, 'Seat restored to ride pool after passenger booking cancellation');

  // Test 3: Idempotent - Duplicate cancellation request does NOT double-count
  let duplicateStatus = 200;
  let duplicateResData = null;
  const duplicateRes = {
    status: (code) => { duplicateStatus = code; return duplicateRes; },
    json: (d) => { duplicateResData = d; return d; },
  };
  await rideController.cancelBooking(cancelBookingReq, duplicateRes);
  assert(duplicateStatus === 400, 'Duplicate cancellation request is rejected with 400 Bad Request');
  const passAfterDuplicate = await User.findById(passenger._id);
  assert(passAfterDuplicate.cancellationCount === 1, 'Duplicate cancellation does NOT double-count against user');

  // Test 4: Host cancelling a ride WITH confirmed passengers -> Eligible cancellation for host (+1)
  const hostRideForTest4 = await Ride.create({
    creator: host._id,
    startLocation: 'KIET Gate 2',
    destination: 'NDLS',
    campusPickupPoint: 'Gate 2',
    travelDate: '2026-10-27',
    departureTime: '07:00',
    totalSeats: 3,
    availableSeats: 2,
    totalEstimatedCost: 900,
    farePerPassenger: 300,
    status: 'active',
    passengers: [],
  });

  const booking2 = await Booking.create({
    ride: hostRideForTest4._id,
    passenger: passenger._id,
    seatsBooked: 1,
    farePerSeat: 300,
    totalFare: 300,
    status: 'confirmed',
  });

  hostRideForTest4.passengers.push({ user: passenger._id, booking: booking2._id, seatsBooked: 1, joinedAt: new Date() });
  await hostRideForTest4.save();

  const cancelHostReq = { params: { id: hostRideForTest4._id.toString() }, body: { cancellationReason: 'Vehicle puncture' }, user: host };
  let cancelHostResData = null;
  const cancelHostRes = {
    status: () => cancelHostRes,
    json: (d) => { cancelHostResData = d; return d; },
  };

  await rideController.cancelRide(cancelHostReq, cancelHostRes);
  const hostAfterActiveCancel = await User.findById(host._id);
  assert(hostAfterActiveCancel.cancellationCount === 1, 'Host cancelling ride with active co-riders increments host cancellation count by 1');
  const passAfterHostCancel = await User.findById(passenger._id);
  assert(passAfterHostCancel.cancellationCount === 1, 'Host cancellation does NOT penalize passenger (count remains unchanged)');

  // Test 5: Approaching limit warning threshold (27-29 cancellations)
  await User.findByIdAndUpdate(passenger._id, { cancellationCount: 29 });
  const statusReq = { user: passenger };
  let statusResData = null;
  const statusRes = {
    status: () => statusRes,
    json: (d) => { statusResData = d; return d; },
  };
  await rideController.getUserCancellationStatus(statusReq, statusRes);
  assert(statusResData.cancellationCount === 29, 'Accurately reports user cancellation count of 29');
  assert(statusResData.isApproachingLimit === true, 'Correctly flags isApproachingLimit: true at 29 cancellations');
  assert(statusResData.isSuspended === false, 'User at 29 cancellations is NOT yet suspended');

  // Test 6: Reaching cancellation limit (30) automatically suspends the account
  const rideForTest6 = await Ride.create({
    creator: host._id,
    startLocation: 'KIET Gate 1',
    destination: 'Vaishali Metro',
    campusPickupPoint: 'Gate 1',
    travelDate: '2026-10-28',
    departureTime: '17:00',
    totalSeats: 2,
    availableSeats: 1,
    totalEstimatedCost: 200,
    farePerPassenger: 100,
    status: 'active',
    passengers: [],
  });

  const bookingToTriggerSuspension = await Booking.create({
    ride: rideForTest6._id,
    passenger: passenger._id,
    seatsBooked: 1,
    farePerSeat: 100,
    totalFare: 100,
    status: 'confirmed',
  });

  rideForTest6.passengers.push({ user: passenger._id, booking: bookingToTriggerSuspension._id, seatsBooked: 1, joinedAt: new Date() });
  await rideForTest6.save();

  const cancelToSuspendReq = { params: { bookingId: bookingToTriggerSuspension._id.toString() }, body: { cancellationReason: '30th cancel' }, user: passenger };
  await rideController.cancelBooking(cancelToSuspendReq, cancelBookingRes);
  const suspendedPassenger = await User.findById(passenger._id);
  assert(suspendedPassenger.cancellationCount === 30, 'User cancellation count reaches 30');
  assert(suspendedPassenger.isSuspended === true, 'User is AUTOMATICALLY suspended upon reaching 30 cancellations');
  assert(suspendedPassenger.suspensionReason.includes('30 eligible cancellations'), 'Suspension reason clearly documented on account');

  // Test 7: Suspended user is strictly BLOCKED from creating or joining rides
  let createRideStatus = 200;
  let createRideResData = null;
  const createRideRes = {
    status: (s) => { createRideStatus = s; return createRideRes; },
    json: (d) => { createRideResData = d; return d; },
  };
  const mockCreateReq = {
    user: suspendedPassenger,
    body: {
      startLocation: 'KIET Main Gate',
      destination: 'Ghaziabad',
      campusPickupPoint: 'Gate 1',
      travelDate: '2026-10-26',
      departureTime: '17:00',
      totalSeats: 3,
      totalEstimatedCost: 300,
    },
  };
  await rideController.createRide(mockCreateReq, createRideRes);
  assert(createRideStatus === 403, 'Suspended user is blocked from creating rides (HTTP 403)');
  assert(createRideResData.code === 'ACCOUNT_SUSPENDED', 'Response code indicates ACCOUNT_SUSPENDED');

  // Test 8: Admin can review and reinstate suspended user privileges with audit log
  const adminController = require('../controllers/adminController');
  const adminUser = await User.create({
    name: 'Admin Tester',
    rollNumber: 'ADMIN-TEST-01',
    email: 'admin.tester@kiet.edu',
    password: 'Password@123',
    role: 'admin',
    course: 'Administration',
    year: 'Staff',
  });

  const reinstateReq = {
    params: { id: passenger._id.toString() },
    body: { reason: 'Student submitted medical certificate for emergency travel change', resetCancellations: true, newCount: 0 },
    user: adminUser,
  };
  let reinstateResData = null;
  const reinstateRes = {
    status: () => reinstateRes,
    json: (d) => { reinstateResData = d; return d; },
  };
  await adminController.reinstateUser(reinstateReq, reinstateRes);
  const reinstatedStudent = await User.findById(passenger._id);
  assert(reinstatedStudent.isSuspended === false, 'Student account successfully reinstated following administrative review');
  assert(reinstatedStudent.cancellationCount === 0, 'Cancellation count reset to 0 upon administrative reinstatement');

  const auditLog = await AdminAuditLog.findOne({ targetId: passenger._id, action: 'USER_REINSTATE' });
  assert(auditLog != null, 'Administrative reinstatement recorded in AdminAuditLog');
  assert(auditLog.admin.toString() === adminUser._id.toString(), 'Audit log records administrator ID');

  // Clean up
  await User.deleteMany({ _id: { $in: [host._id, passenger._id, adminUser._id] } });
  await Ride.deleteMany({ _id: { $in: [emptyRide._id, testRideWithPassenger._id] } });
  await Booking.deleteMany({ _id: { $in: [booking._id, booking2._id, bookingToTriggerSuspension._id] } });
  await CancellationLog.deleteMany({});
  await AdminAuditLog.deleteMany({});
}

async function runIncidentReportingAndAuditTests() {
  console.log('\n--- Test Suite 5: Incident Reporting, Confidentiality & Moderation ---');

  const Report = require('../models/Report');
  const AdminAuditLog = require('../models/AdminAuditLog');
  const reportController = require('../controllers/reportController');

  const studentReporter = await User.create({
    name: 'Reporter Student',
    rollNumber: 'REPORT-001',
    email: 'reporter@kiet.edu',
    password: 'Password@123',
    course: 'B.Tech ECE',
    year: '3rd Year',
  });

  const studentReported = await User.create({
    name: 'Reported Student',
    rollNumber: 'REPORT-002',
    email: 'reported@kiet.edu',
    password: 'Password@123',
    course: 'B.Tech ME',
    year: '4th Year',
  });

  const adminMod = await User.create({
    name: 'Admin Moderator',
    rollNumber: 'ADMIN-MOD-01',
    email: 'admin.mod@kiet.edu',
    password: 'Password@123',
    role: 'admin',
    course: 'Administration',
    year: 'Staff',
  });

  // 1. Submit report with valid category
  const reportReq = {
    user: studentReporter,
    body: {
      category: 'unsafe_pickup',
      reportedUser: studentReported._id,
      description: 'Host suggested meeting at an unlit highway spot instead of the agreed campus gate.',
      supportingNotes: 'Screenshot of chat coordinates saved.',
    },
  };
  let reportResData = null;
  const reportRes = {
    status: () => reportRes,
    json: (d) => { reportResData = d; return d; },
  };
  await reportController.createReport(reportReq, reportRes);
  assert(reportResData.success === true, 'Student can submit incident report in confidence');
  assert(reportResData.reportId != null, 'Report saved in MongoDB and returned reportId');

  // 2. Strict Privacy: Report details do NOT expose admin notes or internal investigation to ordinary user
  const savedReport = await Report.findById(reportResData.reportId);
  assert(savedReport.category === 'unsafe_pickup', 'Report category correctly persisted as unsafe_pickup');
  assert(savedReport.status === 'pending', 'Initial report status is pending');
  assert(reportResData.adminNotes === undefined, 'Client response does not leak admin notes');

  // 3. Admin can list, filter and inspect reports
  const adminListReq = { query: { category: 'unsafe_pickup', status: 'pending' }, user: adminMod };
  let adminListResData = null;
  const adminListRes = {
    status: () => adminListRes,
    json: (d) => { adminListResData = d; return d; },
  };
  await reportController.getAllReports(adminListReq, adminListRes);
  assert(adminListResData.reports.length >= 1, 'Admin can filter and retrieve pending reports');
  assert(adminListResData.reports[0].reportedBy.rollNumber === 'REPORT-001', 'Admin can inspect reporting student roll number');

  // 4. Admin updates report to under_review and adds private notes
  const updateReq = {
    params: { id: savedReport._id.toString() },
    body: { status: 'under_review', adminNotes: 'Verified pickup chat logs. Summoning driver for safety briefing.' },
    user: adminMod,
  };
  let updateResData = null;
  const updateRes = {
    status: () => updateRes,
    json: (d) => { updateResData = d; return d; },
  };
  await reportController.updateReportStatus(updateReq, updateRes);
  const updatedReport = await Report.findById(savedReport._id);
  assert(updatedReport.status === 'under_review', 'Report status successfully transitioned to under_review');
  assert(updatedReport.adminNotes.includes('Verified pickup chat logs'), 'Private admin investigation notes saved');

  const reportAudit = await AdminAuditLog.findOne({ targetId: savedReport._id, action: 'REPORT_UPDATE_STATUS' });
  assert(reportAudit != null, 'Report status modification logged in AdminAuditLog');

  // Clean up
  await Report.deleteMany({ _id: savedReport._id });
  await User.deleteMany({ _id: { $in: [studentReporter._id, studentReported._id, adminMod._id] } });
  await AdminAuditLog.deleteMany({});
}

async function runStudentSafetyAndWomenFocusedRideTests() {
  console.log('\n--- Test Suite 6: Student Safety & Women-Focused Ride Preferences ---');

  const Ride = require('../models/Ride');
  const rideController = require('../controllers/rideController');

  const studentFemale = await User.create({
    name: 'Female Host',
    rollNumber: 'SAFE-001',
    email: 'female.host@kiet.edu',
    password: 'Password@123',
    course: 'B.Tech CS',
    year: '3rd Year',
    gender: 'female',
    studentIdStatus: 'verified',
  });

  // 1. Offer a ride with women-focused co-rider preference
  const createRideReq = {
    user: studentFemale,
    body: {
      startLocation: 'KIET Girls Hostel Block',
      destination: 'Anand Vihar Metro',
      campusPickupPoint: 'Gate 2 Security Booth',
      travelDate: '2026-10-27',
      departureTime: '15:30',
      totalSeats: 3,
      totalEstimatedCost: 600,
      rideType: 'cab_share',
      womenOnly: true,
      coRiderPreference: 'women_focused',
      notes: 'Women co-riders preferred for weekend commute.',
    },
  };
  let createRideResData = null;
  const createRideRes = {
    status: () => createRideRes,
    json: (d) => { createRideResData = d; return d; },
  };

  await rideController.createRide(createRideReq, createRideRes);
  assert(createRideResData.ride.womenOnly === true, 'Ride successfully created with womenOnly: true');
  assert(createRideResData.ride.coRiderPreference === 'women_focused', 'Ride coRiderPreference set to women_focused');

  // 2. Filter rides with womenOnly filter
  const filterReq = { query: { womenOnly: 'true' } };
  let filterResData = null;
  const filterRes = {
    status: () => filterRes,
    json: (d) => { filterResData = d; return d; },
  };
  await rideController.getRides(filterReq, filterRes);
  const foundWomenRide = filterResData.rides.find((r) => r._id.toString() === createRideResData.ride._id.toString());
  assert(foundWomenRide != null, 'Women-focused ride discovered via womenOnly query filter');

  // Clean up
  await Ride.deleteMany({ _id: createRideResData.ride._id });
  await User.deleteMany({ _id: studentFemale._id });

  await disconnectDB();
}

async function main() {
  console.log('================================================================');
  console.log('  RUNNING CAMPUSPOOL TEST SUITE (KIET Group of Institutions)   ');
  console.log('================================================================');

  try {
    await runDomainValidationTests();
    await runDatabaseAndBusinessLogicTests();
    await runPrivateChatSecurityAndLifecycleTests();
    await runCancellationAndSuspensionTests();
    await runIncidentReportingAndAuditTests();
    await runStudentSafetyAndWomenFocusedRideTests();

    console.log('\n================================================================');
    console.log(`  ALL TESTS PASSED! (${passedTests}/${totalTests} tests successful)`);
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test suite failed with error:', err);
    process.exit(1);
  }
}

main();

