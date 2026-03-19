import mongoose from 'mongoose';

export const sessionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    contentType: {
      type: String,
      enum: ['video', 'pdf'],
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, 
      default: null,
    },
    passingScore: {
      type: Number,
      default: 0.7,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ course: 1, order: 1 }, { unique: true });

export const sessionModel = mongoose.model('Session', sessionSchema);