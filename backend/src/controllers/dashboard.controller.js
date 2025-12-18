const mongoose = require('mongoose');
const Guest = require('../models/Guest');
const AttendanceLog = require('../models/AttendanceLog');
const AdminActivityLog = require('../models/AdminActivityLog');

const eventSummary = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const [guestCount, totals] = await Promise.all([
      Guest.countDocuments({ eventId }),
      Guest.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: null,
            totalAllowed: { $sum: '$allowedMembers' },
            totalEntered: { $sum: '$totalEntered' },
          },
        },
      ]),
    ]);
    const t = totals[0] || { totalAllowed: 0, totalEntered: 0 };
    res.json({
      guestCount,
      totalAllowedMembers: t.totalAllowed,
      totalEnteredMembers: t.totalEntered,
      remainingMembers: t.totalAllowed - t.totalEntered,
    });
  } catch (err) {
    next(err);
  }
};

const attendanceLogs = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const logs = await AttendanceLog.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('guestId', 'name')
      .populate('adminId', 'name');
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

const activityLogs = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const logs = await AdminActivityLog.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('guestId', 'name')
      .populate('adminId', 'name');
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

module.exports = { eventSummary, attendanceLogs, activityLogs };


