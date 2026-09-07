const express = require('express');
const router = express.Router();
const googleDriveController = require('../controllers/teachers/googleDriveController');

// Route to get the Google Login URL
// Expects: ?userId=<user_id>
router.get('/auth-url', googleDriveController.generateAuthUrl);

// Route for Google OAuth callback
router.get('/callback', googleDriveController.handleCallback);

// Route to list Excel/CSV files in the user's Drive
// Expects: ?userId=<user_id>
router.get('/files', googleDriveController.listFiles);

// Route to download and parse a specific file
// Expects body: { fileId, userId }
router.post('/import', googleDriveController.importData);

module.exports = router;
