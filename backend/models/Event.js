import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: [true, 'Event name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    date: { type: Date, required: [true, 'Date is required'] },
    // 24h "HH:mm"
    time: {
      type: String,
      required: [true, 'Time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm format'],
    },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    // The organizing club
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: [true, 'Organizer club is required'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Students registered for this event
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // URL path of the uploaded poster (file lives on disk, not in MongoDB)
    poster: { type: String, default: '' },
    // Optional demo/cover image URL (used by seeded events). Shown only when there is no uploaded poster.
    coverImage: { type: String, default: '' },
    // Optional maximum number of registrations (null = unlimited)
    capacity: {
      type: Number,
      default: null,
      min: [1, 'Capacity must be at least 1'],
      validate: { validator: (v) => v == null || Number.isInteger(v), message: 'Capacity must be a whole number' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
