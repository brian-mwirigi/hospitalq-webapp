import mongoose from 'mongoose';

const queueEntrySchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: Number,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      default: '',
    },
    patientAge: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: false,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'done', 'no-show', 'skipped'],
      default: 'waiting',
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
    },
    notes: {
      type: String,
      default: '',
    },
    queueDate: {
      type: Date,
      required: true,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

queueEntrySchema.index({ department: 1, queueDate: 1, status: 1 });

const QueueEntry = mongoose.model('QueueEntry', queueEntrySchema);

export default QueueEntry;
