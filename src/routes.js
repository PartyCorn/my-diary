const express = require('express');
const entryController = require('./controllers/entryController');
const authController = require('./controllers/authController');
const defaultController = require('./controllers/defaultController');
const authenticateJWT = require('./middleware/authenticateJWT');
const router = express.Router();

router.get('/', defaultController.startPage);
router.get('/terms', defaultController.termsPage);
router.get('/settings', authenticateJWT, defaultController.settingsPage);
router.get('/api/settings', authenticateJWT, defaultController.getSettings);
router.get('/api/hashtags', authenticateJWT, defaultController.getHashtags);
router.post('/settings', authenticateJWT, defaultController.updateSettings);

router.get('/home', authenticateJWT, entryController.homePage);

router.get('/entries/:year/:month/:day', authenticateJWT, entryController.getEntriesByDate);
router.post('/entries', authenticateJWT, entryController.createEntry);
router.put('/entries/:id', authenticateJWT, entryController.updateEntry);
router.delete('/entries/:id', authenticateJWT, entryController.deleteEntry);

router.post('/search', authenticateJWT, entryController.searchEntries);

router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/register', authController.registerPage);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
// router.get('/forgot-password', authController.forgotPasswordPage);

module.exports = router;
