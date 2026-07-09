import mongoose from 'mongoose';

const dailyCounterSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  lastNumber: {
    type: Number,
    default: 0,
  },
});

dailyCounterSchema.index({ department: 1, date: 1 }, { unique: true });

const DailyCounter = mongoose.model('DailyCounter', dailyCounterSchema);

export default DailyCounter;
