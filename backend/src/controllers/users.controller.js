const usersService = require('../services/users.service');

function validationError(message) {
  return Object.assign(new Error(message), { status: 400, code: 'VALIDATION_ERROR' });
}

async function getMe(req, res, next) {
  try {
    const user = await usersService.getUserById(req.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name } = req.body || {};

    if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
      throw validationError('이름은 1~50자여야 합니다.');
    }

    const user = await usersService.updateUserName(req.userId, name);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe };
