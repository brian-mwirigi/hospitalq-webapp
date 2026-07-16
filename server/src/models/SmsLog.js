import mongoose from 'mongoose';

const smsLogSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['mock-sent', 'failed'],
      default: 'mock-sent',
    },
    relatedTicket: { type: Number, default: null },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
  },
  { timestamps: true }
);

const SmsLog = mongoose.model('SmsLog', smsLogSchema);

export default SmsLog;
