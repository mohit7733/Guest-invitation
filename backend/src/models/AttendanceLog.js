const mongoose = require('mongoose');

const { Schema } = mongoose;

const AttendanceLogSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    guestId: { type: Schema.Types.ObjectId, ref: 'Guest', required: true, index: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'InviteUser', required: true },
    membersEntered: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AttendanceLog', AttendanceLogSchema);


