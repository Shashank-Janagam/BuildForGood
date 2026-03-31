import mongoose from 'mongoose';

const CoFounderSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  domain:       { type: String, required: true },        // e.g. 'Climate', 'Health', etc.
  tier:         { type: String, enum: ['Newbie', 'Amateur', 'Professional'], required: true },
  score:        { type: Number, required: true },         // quiz score 0-7
  specialty:    { type: String, required: true },
  bio:          { type: String, default: '' },
  price:        { type: Number, required: true },         // monthly price in ₹
  rating:       { type: Number, default: 3.5 },
  isRecruited:  { type: Boolean, default: false },
  recruitedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Simulation', default: null },
  createdAt:    { type: Date, default: Date.now },
});

export default mongoose.model('CoFounder', CoFounderSchema);
