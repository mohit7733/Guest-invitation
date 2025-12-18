const express = require('express');
const { login, seedSuperAdmin } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
// one-time super admin creation; you may remove/secure this in production
router.post('/seed-super-admin', seedSuperAdmin);

module.exports = router;


