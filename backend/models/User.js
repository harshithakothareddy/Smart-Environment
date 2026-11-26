const mongoose = require('mongoose');

const savedLocationSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    label: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    state: { type: String, default: '', trim: true },
    aqi: { type: Number, default: 50 },
  },
  { _id: false }
);

const loginEventSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, default: 'unknown' },
    userAgent: { type: String, default: 'unknown' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Citizen', 'Admin'],
      default: 'Citizen',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    savedLocations: {
      type: [savedLocationSchema],
      default: [
        { id: 1, label: 'Home', name: 'Hyderabad', state: 'Telangana', aqi: 56 },
        { id: 2, label: 'Work', name: 'Hyderabad', state: 'Telangana', aqi: 56 },
        { id: 3, label: 'Outdoor', name: 'Hyderabad', state: 'Telangana', aqi: 56 },
      ],
    },
    notificationPreferences: {
      airAlerts: { type: Boolean, default: true },
      waterAlerts: { type: Boolean, default: true },
      dailySummary: { type: Boolean, default: false },
      newsUpdates: { type: Boolean, default: false },
    },
    loginCount: {
      type: Number,
      default: 1,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    loginHistory: {
      type: [loginEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone || '',
    savedLocations: this.savedLocations || [],
    notificationPreferences: this.notificationPreferences || {
      airAlerts: true,
      waterAlerts: true,
      dailySummary: false,
      newsUpdates: false,
    },
    loginCount: this.loginCount || 1,
    lastLoginAt: this.lastLoginAt,
    loginHistory: (this.loginHistory || []).slice(-10).reverse(),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

