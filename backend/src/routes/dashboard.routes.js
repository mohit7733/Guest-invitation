const express = require('express');
const {
  eventSummary,
  attendanceLogs,
  activityLogs,
} = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.use(authenticate);

router.get(
  '/event/:eventId/summary',
  authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN),
  eventSummary
);

router.get(
  '/event/:eventId/attendance-logs',
  authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN),
  attendanceLogs
);

router.get(
  '/event/:eventId/activity-logs',
  authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN),
  activityLogs
);

module.exports = router;


