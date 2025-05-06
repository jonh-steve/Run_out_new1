/**
 * Routes cho quản lý người dùng
 * @author Steve
 * @project RunOut-Biliard
 * 
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {(req: Request, res: Response, next: NextFunction) => any} ExpressMiddleware
 */

const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../../middleware/authMiddleware'); // Cập nhật từ auth thành authMiddleware
const { validateMongoId, validate } = require('../../middleware/validate');
const userValidator = require('../../common/validators/userValidator');

/**
 * @type {express.Router}
 */
const router = express.Router();

/**
 * @route   POST /api/users
 * @desc    Tạo người dùng mới (chỉ admin)
 * @access  Private/Admin
 */
router.post(
  '/',
  /** @type {ExpressMiddleware} */ (authenticate),
  /** @type {ExpressMiddleware} */ (authorize('admin')),
  /** @type {ExpressMiddleware} */ (validate(userValidator.createUser)),
  /** @type {ExpressMiddleware} */ (userController.createUser)
);

/**
 * @route   GET /api/users
 * @desc    Lấy danh sách người dùng (chỉ admin)
 * @access  Private/Admin
 */
router.get(
  '/',
  /** @type {ExpressMiddleware} */ (authenticate),
  /** @type {ExpressMiddleware} */ (authorize('admin')),
  /** @type {ExpressMiddleware} */ (userController.getUsers)
);

/**
 * @route   GET /api/users/:id
 * @desc    Lấy thông tin người dùng theo ID
 * @access  Private
 */
router.get(
  '/:id',
  /** @type {ExpressMiddleware} */ (authenticate),
  /** @type {ExpressMiddleware} */ (validateMongoId()),
  /** @type {ExpressMiddleware} */ (userController.getUserById)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Cập nhật thông tin người dùng
 * @access  Private
 */
router.put(
  '/:id',
  /** @type {ExpressMiddleware} */ (authenticate),
  /** @type {ExpressMiddleware} */ (validateMongoId()),
  /** @type {ExpressMiddleware} */ (validate(userValidator.updateUser)),
  /** @type {ExpressMiddleware} */ (userController.updateUser)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Xóa người dùng (chỉ admin)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  /** @type {ExpressMiddleware} */ (authenticate),
  /** @type {ExpressMiddleware} */ (authorize('admin')),
  /** @type {ExpressMiddleware} */ (validateMongoId()),
  /** @type {ExpressMiddleware} */ (userController.deleteUser)
);

/**
 * @route   GET /api/users/profile/me
 * @desc    Lấy thông tin người dùng hiện tại
 * @access  Private
 */
router.get(
  '/profile/me',
  /** @type {ExpressMiddleware} */ (authenticate),
  /** @type {ExpressMiddleware} */ (userController.getProfile)
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Thay đổi mật khẩu
 * @access  Private
 */
router.put(
  '/change-password',
  /** @type {ExpressMiddleware} */ (authenticate),
  /** @type {ExpressMiddleware} */ (validate(userValidator.changePassword)),
  /** @type {ExpressMiddleware} */ (userController.changePassword)
);

module.exports = router;