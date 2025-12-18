const mongoose = require('mongoose');
const { ROLES } = require('../utils/roles');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), required: true },
    assignedEventIds: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InviteUser', UserSchema);


