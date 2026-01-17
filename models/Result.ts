import mongoose from 'mongoose';

export interface IResult extends mongoose.Document {
  eventCode: string;
  eventName: string;
  category: string;
  chestNo: string;
  studentName: string;
  className: string; // 'class' is a reserved keyword
  school: string;
  grade: string;
  place: string;
  points: number;
}

const ResultSchema = new mongoose.Schema({
  eventCode: { type: String, required: true },
  eventName: { type: String, required: true },
  category: { type: String, required: true },
  chestNo: { type: String },
  studentName: { type: String, required: true },
  className: { type: String },
  school: { type: String, required: true },
  grade: { type: String },
  place: { type: String },
  points: { type: Number, default: 0 },
}, { timestamps: true });

// Create a compound index to help with "Sync/Replace" logic and generic querying
ResultSchema.index({ eventCode: 1, category: 1 });
ResultSchema.index({ school: 1 });

export default mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
