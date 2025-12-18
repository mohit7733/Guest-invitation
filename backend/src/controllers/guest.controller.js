const Guest = require('../models/Guest');
const AdminActivityLog = require('../models/AdminActivityLog');
const { generateGuestQrToken, generateQrImageDataUrl } = require('../services/qrService');

const listGuestsForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const guests = await Guest.find({ eventId }).sort({ name: 1 });
    res.json(guests);
  } catch (err) {
    next(err);
  }
};

const createGuest = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, companyName, email, phone, allowedMembers, guestType } = req.body;
    let guest = new Guest({
      eventId,
      name,
      companyName,
      email,
      phone,
      allowedMembers,
      guestType,
      qrToken: '',
    });
    guest.qrToken = generateGuestQrToken(guest._id.toString(), eventId);
    guest = await guest.save();
    res.status(201).json(guest);
  } catch (err) {
    next(err);
  }
};

const updateGuest = async (req, res, next) => {
  try {
    const { guestId } = req.params;
    const guest = await Guest.findByIdAndUpdate(guestId, req.body, { new: true });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    next(err);
  }
};

const updateAllowedMembers = async (req, res, next) => {
  try {
    const { guestId } = req.params;
    const { allowedMembers } = req.body;
    const adminId = req.user.id;
    const guest = await Guest.findById(guestId);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    const oldAllowed = guest.allowedMembers;
    guest.allowedMembers = allowedMembers;
    await guest.save();
    await AdminActivityLog.create({
      adminId,
      eventId: guest.eventId,
      guestId: guest._id,
      action: 'UPDATE_ALLOWED_MEMBERS',
      details: { from: oldAllowed, to: allowedMembers },
    });
    res.json(guest);
  } catch (err) {
    next(err);
  }
};

const getGuestQr = async (req, res, next) => {
  try {
    const { guestId } = req.params;
    const guest = await Guest.findById(guestId);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    const dataUrl = await generateQrImageDataUrl(guest.qrToken);
    res.json({ dataUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listGuestsForEvent,
  createGuest,
  updateGuest,
  updateAllowedMembers,
  getGuestQr,
};


