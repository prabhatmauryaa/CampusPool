const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isValidKietEmail } = require('../utils/domainValidator');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Register student
exports.register = async (req, res) => {
  try {
    const { name, rollNumber, email, course, year, password, confirmPassword, agreedToTerms } = req.body;

    if (!name || !rollNumber || !email || !course || !year || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Roll Number, Email, Course, Year, Password) are required.',
      });
    }

    if (!agreedToTerms) {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the CampusPool Terms of Service and Privacy Policy.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Strict college email domain validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidKietEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'CampusPool is currently available only to eligible KIET students. Please register using your @kiet.edu college email address.',
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this @kiet.edu email already exists. Please log in.',
      });
    }

    // Check duplicate roll number
    const normalizedRoll = rollNumber.trim().toUpperCase();
    const existingRoll = await User.findOne({ rollNumber: normalizedRoll });
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: 'An account with this college roll number is already registered.',
      });
    }

    // Determine role - client cannot elevate privileges
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kiet.edu').toLowerCase();
    const role = trimmedEmail === adminEmail ? 'admin' : 'student';

    const user = new User({
      name: name.trim(),
      rollNumber: normalizedRoll,
      email: trimmedEmail,
      course: course.trim(),
      year: year.trim(),
      password,
      role,
      emailVerified: true,
      studentIdStatus: 'pending',
    });

    await user.save();

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to CampusPool.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Registration failed due to a server error. Please try again.',
      error: err.message,
    });
  }
};

// Login student
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both college email and password.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Verify expected KIET domain on login
    if (!isValidKietEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'CampusPool is available only to eligible KIET students. Please sign in with your @kiet.edu college email.',
      });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Login successful. Welcome back to CampusPool!',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed due to a server error. Please try again.',
    });
  }
};

// Get current authenticated user
exports.getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
    });
  }
};

// Update profile (phone, bio)
exports.updateProfile = async (req, res) => {
  try {
    const { phone, bio, course, year, gender, emergencyContact } = req.body;
    const user = req.user;

    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (course !== undefined && course.trim()) user.course = course.trim();
    if (year !== undefined && year.trim()) user.year = year.trim();
    if (gender && ['unspecified', 'female', 'male', 'other'].includes(gender)) {
      user.gender = gender;
    }
    if (emergencyContact && typeof emergencyContact === 'object') {
      user.emergencyContact = {
        name: emergencyContact.name ? emergencyContact.name.trim() : user.emergencyContact?.name || '',
        phone: emergencyContact.phone ? emergencyContact.phone.trim() : user.emergencyContact?.phone || '',
        relationship: emergencyContact.relationship ? emergencyContact.relationship.trim() : user.emergencyContact?.relationship || '',
      };
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: err.message,
    });
  }
};

// Submit Student ID verification request
exports.submitIdVerification = async (req, res) => {
  try {
    const { studentIdDocumentUrl } = req.body;
    const user = req.user;

    user.studentIdStatus = 'pending';
    if (studentIdDocumentUrl) {
      user.studentIdDocumentUrl = studentIdDocumentUrl;
    }
    await user.save();

    return res.json({
      success: true,
      message: 'Student ID submitted for review by KIET Campus Admin. Verification is pending.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit verification.',
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.clearCookie('auth_token');
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};
