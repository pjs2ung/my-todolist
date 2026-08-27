const router = require('express').Router();
const authMiddleware = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/users.controller');

router.use(authMiddleware);
router.get('/me', ctrl.getMe);
router.patch('/me', ctrl.updateMe);

module.exports = router;
