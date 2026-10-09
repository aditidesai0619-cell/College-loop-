import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Club name is required'], unique: true, trim: true },
    // Number of members in the club
    members: { type: Number, default: 22, min: [0, 'Members cannot be negative'] },
  },
  { timestamps: true }
);

export default mongoose.model('Club', clubSchema);
