const router = require('express').Router();
const authMiddleware = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/todos.controller');

router.use(authMiddleware);
router.get('/', ctrl.listTodos);
router.post('/', ctrl.createTodo);
router.patch('/:id', ctrl.updateTodo);
router.delete('/:id', ctrl.deleteTodo);

module.exports = router;
