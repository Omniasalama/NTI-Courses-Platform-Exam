import mongoose from 'mongoose';

export const questionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 2 && arr.length <= 5,
        message: 'Options must have between 2 and 5 items',
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const questionModel = mongoose.model('Question', questionSchema);
