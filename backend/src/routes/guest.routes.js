const express = require('express');
const {
  listGuestsForEvent,
  createGuest,
  updateGuest,
  updateAllowedMembers,
  getGuestQr,
} = require('../controllers/guest.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.use(authenticate);

router
  .route('/events/:eventId/guests')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN), listGuestsForEvent)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN), createGuest);

router
  .route('/guests/:guestId')
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN), updateGuest);

router
  .route('/guests/:guestId/allowed-members')
  .patch(authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN), updateAllowedMembers);

router
  .route('/guests/:guestId/qr')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN), getGuestQr);

module.exports = router;


