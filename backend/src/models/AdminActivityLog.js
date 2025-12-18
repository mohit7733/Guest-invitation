const mongoose = require('mongoose');

const { Schema } = mongoose;

const AdminActivityLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'InviteUser', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    guestId: { type: Schema.Types.ObjectId, ref: 'Guest' },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminActivityLog', AdminActivityLogSchema);


