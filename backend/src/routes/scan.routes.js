const express = require('express');
const { validateScan, registerEntry } = require('../controllers/scan.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.use(authenticate);

router.post(
  '/validate',
  authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN),
  validateScan
);

router.post(
  '/enter',
  authorize(ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN),
  registerEntry
);

module.exports = router;


