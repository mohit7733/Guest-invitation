const Guest = require('../models/Guest');
const AttendanceLog = require('../models/AttendanceLog');
const AdminActivityLog = require('../models/AdminActivityLog');
const { verifyGuestQrToken } = require('../services/qrService');

const validateScan = async (req, res, next) => {
  try {
    const { token, eventId } = req.body;
    const payload = verifyGuestQrToken(token);
    if (payload.eventId !== eventId) {
      return res.status(400).json({ message: 'QR does not belong to this event' });
    }
    const guest = await Guest.findById(payload.guestId);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    const remaining = guest.allowedMembers - guest.totalEntered;
    return res.json({
      guest: {
        id: guest._id,
        name: guest.name,
        companyName: guest.companyName,
        email: guest.email,
        phone: guest.phone,
        guestType: guest.guestType,
        allowedMembers: guest.allowedMembers,
        totalEntered: guest.totalEntered,
        remaining,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid QR token' });
  }
};

const registerEntry = async (req, res, next) => {
  try {
    const { token, eventId, membersToEnter } = req.body;
    const adminId = req.user.id;
    if (!membersToEnter || membersToEnter <= 0) {
      return res.status(400).json({ message: 'membersToEnter must be positive' });
    }
    const payload = verifyGuestQrToken(token);
    if (payload.eventId !== eventId) {
      return res.status(400).json({ message: 'QR does not belong to this event' });
    }
    const guest = await Guest.findOne({ _id: payload.guestId, eventId });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    const remaining = guest.allowedMembers - guest.totalEntered;
    // if (membersToEnter > remaining) {
    //   return res.status(400).json({ message: 'Count exceeds allowed members' });
    // }
    guest.totalEntered += membersToEnter;
    await guest.save();
    await AttendanceLog.create({
      eventId,
      guestId: guest._id,
      adminId,
      membersEntered: membersToEnter,
    });
    await AdminActivityLog.create({
      adminId,
      eventId,
      guestId: guest._id,
      action: 'REGISTER_ENTRY',
      details: { membersToEnter },
    });
    return res.json({
      totalEntered: guest.totalEntered,
      remaining: guest.allowedMembers - guest.totalEntered,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { validateScan, registerEntry };


