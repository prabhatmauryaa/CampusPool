const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isValidKietEmail } = require('../utils/domainValidator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'College roll number / student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidKietEmail,
        message: 'CampusPool is currently available only to eligible KIET students. Please register using your @kiet.edu college email address.',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    course: {
      type: String,
      required: [true, 'Course / Programme is required'],
      trim: true,
      default: 'B.Tech CSE',
    },
    year: {
      type: String,
      required: [true, 'Current year or semester is required'],
      trim: true,
      default: '3rd Year',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    studentIdStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'pending',
    },
    studentIdDocumentUrl: {
      type: String,
      default: '',
    },
    cancellationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    reinstatedAt: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['unspecified', 'female', 'male', 'other'],
      default: 'unspecified',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe representation for frontend responses
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
