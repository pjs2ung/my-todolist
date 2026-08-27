const router = require('express').Router();
const authMiddleware = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/categories.controller');

router.use(authMiddleware);
router.get('/', ctrl.getCategories);
router.post('/', ctrl.createCategory);
router.patch('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;
