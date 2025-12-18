const mongoose = require('mongoose');

const { Schema } = mongoose;

const GuestSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true },
    companyName: { type: String },
    email: { type: String },
    phone: { type: String },
    allowedMembers: { type: Number, required: true, min: 1 },
    guestType: { type: String, default: 'REGULAR' },
    qrToken: { type: String, required: true },
    totalEntered: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guest', GuestSchema);


