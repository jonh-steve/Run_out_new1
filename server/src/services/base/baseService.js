/**
 * Base Service - cung cấp các phương thức CRUD cơ bản
 * @author Steve
 * @project RunOut-Biliard
 */

const { ApiError } = require('../../api/middleware/errorHandler');
const logger = require('../../config/logger');

/**
 * Lớp BaseService cung cấp các phương thức CRUD cơ bản cho các service
 */
class BaseService {
  /**
   * Khởi tạo service với model tương ứng
   * @param {mongoose.Model} model - Mongoose model
   * @param {string} modelName - Tên của model (dùng cho log và thông báo lỗi)
   */
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName || model.modelName;
  }

  /**
   * Lấy tất cả documents với filter, sort và pagination
   * @param {Object} filter - Điều kiện filter
   * @param {Object} options - Các options bổ sung (sort, pagination, select)
   * @returns {Promise<{data: Array, pagination: Object}>} - Dữ liệu và thông tin phân trang
   */
  async findAll(filter = {}, options = {}) {
    try {
      const { sort = '-createdAt', page = 1, limit = 10, select = '', populate = '' } = options;

      const skip = (page - 1) * limit;

      // Build query
      let query = this.model.find(filter);

      // Apply select fields
      if (select) {
        query = query.select(select);
      }

      // Apply populate
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach((field) => {
            query = query.populate(field);
          });
        } else {
          query = query.populate(populate);
        }
      }

      // Execute query with sort, skip and limit
      const data = await query.sort(sort).skip(skip).limit(limit);

      // Count total documents matching filter
      const total = await this.model.countDocuments(filter);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      logger.error(`Error in ${this.modelName}.findAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy document theo ID
   * @param {string} id - MongoDB ObjectId
   * @param {Object} options - Các options (select, populate)
   * @returns {Promise<Document>} - Document tìm thấy
   * @throws {ApiError} - 404 nếu không tìm thấy
   */
  async findById(id, options = {}) {
    try {
      const { select = '', populate = '' } = options;

      // Build query
      let query = this.model.findById(id);

      // Apply select fields
      if (select) {
        query = query.select(select);
      }

      // Apply populate
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach((field) => {
            query = query.populate(field);
          });
        } else {
          query = query.populate(populate);
        }
      }

      // Execute query
      const data = await query;

      // Throw error if not found
      if (!data) {
        throw new ApiError(404, `${this.modelName} không tìm thấy với ID: ${id}`);
      }

      return data;
    } catch (error) {
      // Rethrow ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error(`Error in ${this.modelName}.findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tạo document mới
   * @param {Object} data - Dữ liệu cho document mới
   * @returns {Promise<Document>} - Document đã tạo
   */
  async create(data) {
    try {
      const newDoc = await this.model.create(data);
      return newDoc;
    } catch (error) {
      logger.error(`Error in ${this.modelName}.create: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật document theo ID
   * @param {string} id - MongoDB ObjectId
   * @param {Object} data - Dữ liệu cập nhật
   * @param {Object} options - Các options (new, runValidators)
   * @returns {Promise<Document>} - Document đã cập nhật
   * @throws {ApiError} - 404 nếu không tìm thấy
   */
  async update(id, data, options = {}) {
    try {
      const opts = {
        new: true,
        runValidators: true,
        ...options,
      };

      const updated = await this.model.findByIdAndUpdate(id, data, opts);

      if (!updated) {
        throw new ApiError(404, `${this.modelName} không tìm thấy với ID: ${id}`);
      }

      return updated;
    } catch (error) {
      // Rethrow ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error(`Error in ${this.modelName}.update: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xóa document theo ID
   * @param {string} id - MongoDB ObjectId
   * @returns {Promise<Document>} - Document đã xóa
   * @throws {ApiError} - 404 nếu không tìm thấy
   */
  async delete(id) {
    try {
      const deleted = await this.model.findByIdAndDelete(id);

      if (!deleted) {
        throw new ApiError(404, `${this.modelName} không tìm thấy với ID: ${id}`);
      }

      return deleted;
    } catch (error) {
      // Rethrow ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error(`Error in ${this.modelName}.delete: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kiểm tra sự tồn tại của document theo ID
   * @param {string} id - MongoDB ObjectId
   * @returns {Promise<boolean>} - true nếu document tồn tại, false nếu không
   */
  async exists(id) {
    try {
      const count = await this.model.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      logger.error(`Error in ${this.modelName}.exists: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BaseService;
