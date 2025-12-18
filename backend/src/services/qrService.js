const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { env } = require('../config/env');

const generateGuestQrToken = (guestId, eventId) => {
  const payload = { guestId, eventId };
  return jwt.sign(payload, env.QR_SECRET, { expiresIn: '30d' });
};

const verifyGuestQrToken = (token) => jwt.verify(token, env.QR_SECRET);

const generateQrImageDataUrl = async (token) =>
  QRCode.toDataURL(token, {
    width: 300,
    margin: 2,
  });

module.exports = {
  generateGuestQrToken,
  verifyGuestQrToken,
  generateQrImageDataUrl,
};


