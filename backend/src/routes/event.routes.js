const express = require('express');
const {
  listEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN), listEvents)
  .post(authorize(ROLES.SUPER_ADMIN), createEvent);

router
  .route('/:id')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN), getEvent)
  .put(authorize(ROLES.SUPER_ADMIN), updateEvent)
  .delete(authorize(ROLES.SUPER_ADMIN), deleteEvent);

module.exports = router;


