// server/src/services/cache/redisCache.js
const redis = require('redis');
const { promisify } = require('util');
const config = require('../../config/environment');
const { logger } = require('../../utils/logger'); // Sửa cách import logger

class RedisCache {
  constructor() {
    this.isConnected = false;
    this.client = redis.createClient({
      url: config.redis.url,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Kết nối Redis bị từ chối. Đảm bảo Redis server đang chạy.');
          return new Error('Kết nối Redis bị từ chối');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Đã vượt quá thời gian thử lại kết nối Redis.');
          return new Error('Đã vượt quá thời gian thử lại');
        }
        if (options.attempt > 10) {
          logger.error('Đã vượt quá số lần thử lại kết nối Redis.');
          return undefined;
        }
        // Thử lại sau một khoảng thời gian tăng dần
        return Math.min(options.attempt * 100, 3000);
      },
    });

    // Xử lý sự kiện Redis trước khi promisify
    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Lỗi Redis:', error);
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Đã kết nối thành công đến Redis server');
    });

    this.client.on('reconnecting', () => {
      logger.info('Đang thử kết nối lại đến Redis server...');
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('Kết nối Redis đã đóng');
    });

    // Promisify các phương thức Redis - Sửa cách thực hiện bind
    this._initPromisifiedMethods();
  }

  /**
   * Khởi tạo các phương thức Redis đã promisify với kiểm tra an toàn
   * @private
   */
  _initPromisifiedMethods() {
    try {
      // Kiểm tra xem client có tồn tại không
      if (!this.client) {
        throw new Error('Redis client chưa được khởi tạo');
      }

      // Sử dụng try-catch riêng cho từng phương thức
      try {
        if (typeof this.client.get === 'function')
          this.getAsync = promisify(this.client.get.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức get');
      }

      try {
        if (typeof this.client.set === 'function')
          this.setAsync = promisify(this.client.set.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức set');
      }

      try {
        if (typeof this.client.del === 'function')
          this.delAsync = promisify(this.client.del.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức del');
      }

      try {
        if (typeof this.client.keys === 'function')
          this.keysAsync = promisify(this.client.keys.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức keys');
      }

      try {
        if (typeof this.client.flushdb === 'function')
          this.flushdbAsync = promisify(this.client.flushdb.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức flushdb');
      }

      try {
        if (typeof this.client.exists === 'function')
          this.existsAsync = promisify(this.client.exists.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức exists');
      }

      try {
        if (typeof this.client.expire === 'function')
          this.expireAsync = promisify(this.client.expire.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức expire');
      }

      try {
        if (typeof this.client.ttl === 'function')
          this.ttlAsync = promisify(this.client.ttl.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức ttl');
      }

      try {
        if (typeof this.client.incr === 'function')
          this.incrAsync = promisify(this.client.incr.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức incr');
      }

      try {
        if (typeof this.client.decr === 'function')
          this.decrAsync = promisify(this.client.decr.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức decr');
      }

      try {
        if (typeof this.client.hgetall === 'function')
          this.hgetallAsync = promisify(this.client.hgetall.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức hgetall');
      }

      try {
        if (typeof this.client.hset === 'function')
          this.hsetAsync = promisify(this.client.hset.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức hset');
      }

      try {
        if (typeof this.client.hmset === 'function')
          this.hmsetAsync = promisify(this.client.hmset.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức hmset');
      }

      try {
        if (typeof this.client.hdel === 'function')
          this.hdelAsync = promisify(this.client.hdel.bind(this.client));
      } catch (e) {
        logger.warn('Không thể promisify phương thức hdel');
      }

      logger.info('Các phương thức Redis đã được promisify thành công');
    } catch (error) {
      logger.error('Lỗi khi promisify các phương thức Redis:', error);
      throw new Error('Không thể khởi tạo các phương thức Redis: ' + error.message);
    }
  }

  /**
   * Kiểm tra trạng thái kết nối Redis
   * @returns {boolean} Trạng thái kết nối
   */
  isReady() {
    return this.isConnected;
  }

  /**
   * Lấy dữ liệu từ cache
   * @param {string} key - Khóa cache
   * @returns {Promise<any>} Dữ liệu đã lưu trong cache hoặc null
   */
  async get(key) {
    try {
      const data = await this.getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Lỗi khi lấy cache với khóa ${key}:`, error);
      return null;
    }
  }

  /**
   * Lưu dữ liệu vào cache
   * @param {string} key - Khóa cache
   * @param {any} value - Dữ liệu cần lưu
   * @param {number} ttl - Thời gian sống (giây)
   * @returns {Promise<boolean>} Kết quả lưu cache
   */
  async set(key, value, ttl = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.setAsync(key, serializedValue, 'EX', ttl);
      return true;
    } catch (error) {
      logger.error(`Lỗi khi lưu cache với khóa ${key}:`, error);
      return false;
    }
  }

  /**
   * Xóa dữ liệu khỏi cache
   * @param {string} key - Khóa cache
   * @returns {Promise<boolean>} Kết quả xóa cache
   */
  async delete(key) {
    try {
      const result = await this.delAsync(key);
      return result > 0;
    } catch (error) {
      logger.error(`Lỗi khi xóa cache với khóa ${key}:`, error);
      return false;
    }
  }

  /**
   * Tạo khóa cache từ prefix và tham số
   * @param {string} prefix - Tiền tố cho khóa
   * @param {object} params - Tham số để tạo khóa
   * @returns {string} Khóa cache đã tạo
   */
  generateKey(prefix, params) {
    if (typeof params === 'object') {
      // Sắp xếp các khóa để đảm bảo tính nhất quán
      const sortedParams = {};
      Object.keys(params)
        .sort()
        .forEach((key) => {
          sortedParams[key] = params[key];
        });
      return `${prefix}:${Buffer.from(JSON.stringify(sortedParams)).toString('base64')}`;
    }
    return `${prefix}:${params}`;
  }

  /**
   * Kiểm tra xem khóa có tồn tại trong cache không
   * @param {string} key - Khóa cache
   * @returns {Promise<boolean>} Kết quả kiểm tra
   */
  async exists(key) {
    try {
      const result = await this.existsAsync(key);
      return result === 1;
    } catch (error) {
      logger.error(`Lỗi khi kiểm tra tồn tại khóa ${key}:`, error);
      return false;
    }
  }

  /**
   * Cập nhật thời gian hết hạn cho khóa
   * @param {string} key - Khóa cache
   * @param {number} ttl - Thời gian sống mới (giây)
   * @returns {Promise<boolean>} Kết quả cập nhật
   */
  async expire(key, ttl) {
    try {
      const result = await this.expireAsync(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error(`Lỗi khi cập nhật thời gian hết hạn cho khóa ${key}:`, error);
      return false;
    }
  }

  /**
   * Lấy thời gian còn lại trước khi khóa hết hạn
   * @param {string} key - Khóa cache
   * @returns {Promise<number>} Thời gian còn lại (giây)
   */
  async ttl(key) {
    try {
      return await this.ttlAsync(key);
    } catch (error) {
      logger.error(`Lỗi khi lấy TTL cho khóa ${key}:`, error);
      return -2; // -2 là giá trị Redis trả về khi khóa không tồn tại
    }
  }

  /**
   * Tăng giá trị của khóa lên 1
   * @param {string} key - Khóa cache
   * @returns {Promise<number>} Giá trị mới
   */
  async increment(key) {
    try {
      return await this.incrAsync(key);
    } catch (error) {
      logger.error(`Lỗi khi tăng giá trị cho khóa ${key}:`, error);
      return null;
    }
  }

  /**
   * Giảm giá trị của khóa đi 1
   * @param {string} key - Khóa cache
   * @returns {Promise<number>} Giá trị mới
   */
  async decrement(key) {
    try {
      return await this.decrAsync(key);
    } catch (error) {
      logger.error(`Lỗi khi giảm giá trị cho khóa ${key}:`, error);
      return null;
    }
  }

  /**
   * Xóa tất cả các khóa có cùng pattern
   * @param {string} pattern - Mẫu khóa cần xóa (ví dụ: 'products:*')
   * @returns {Promise<number>} Số lượng khóa đã xóa
   */
  async deleteByPattern(pattern) {
    try {
      const keys = await this.keysAsync(pattern);
      if (keys.length > 0) {
        return await this.delAsync(keys);
      }
      return 0;
    } catch (error) {
      logger.error(`Lỗi khi xóa cache theo mẫu ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Xóa toàn bộ cache
   * @returns {Promise<boolean>} Kết quả xóa cache
   */
  async flush() {
    try {
      await this.flushdbAsync();
      logger.info('Đã xóa toàn bộ cache');
      return true;
    } catch (error) {
      logger.error('Lỗi khi xóa toàn bộ cache:', error);
      return false;
    }
  }

  /**
   * Lấy tất cả các trường và giá trị của một hash
   * @param {string} key - Khóa hash
   * @returns {Promise<object>} Đối tượng chứa các trường và giá trị
   */
  async getHash(key) {
    try {
      const data = await this.hgetallAsync(key);
      if (!data) return null;

      // Chuyển đổi các giá trị từ JSON string sang object
      const result = {};
      for (const field in data) {
        try {
          result[field] = JSON.parse(data[field]);
        } catch (e) {
          result[field] = data[field];
        }
      }
      return result;
    } catch (error) {
      logger.error(`Lỗi khi lấy hash với khóa ${key}:`, error);
      return null;
    }
  }

  /**
   * Lưu một trường vào hash
   * @param {string} key - Khóa hash
   * @param {string} field - Tên trường
   * @param {any} value - Giá trị cần lưu
   * @returns {Promise<boolean>} Kết quả lưu hash
   */
  async setHashField(key, field, value) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.hsetAsync(key, field, serializedValue);
      return true;
    } catch (error) {
      logger.error(`Lỗi khi lưu trường hash ${field} với khóa ${key}:`, error);
      return false;
    }
  }

  /**
   * Lưu nhiều trường vào hash
   * @param {string} key - Khóa hash
   * @param {object} fields - Đối tượng chứa các trường và giá trị
   * @returns {Promise<boolean>} Kết quả lưu hash
   */
  async setHash(key, fields) {
    try {
      const serializedFields = {};
      for (const field in fields) {
        serializedFields[field] = JSON.stringify(fields[field]);
      }
      await this.hmsetAsync(key, serializedFields);
      return true;
    } catch (error) {
      logger.error(`Lỗi khi lưu hash với khóa ${key}:`, error);
      return false;
    }
  }

  /**
   * Xóa một trường khỏi hash
   * @param {string} key - Khóa hash
   * @param {string} field - Tên trường
   * @returns {Promise<boolean>} Kết quả xóa trường
   */
  async deleteHashField(key, field) {
    try {
      const result = await this.hdelAsync(key, field);
      return result > 0;
    } catch (error) {
      logger.error(`Lỗi khi xóa trường hash ${field} với khóa ${key}:`, error);
      return false;
    }
  }

  /**
   * Đóng kết nối Redis
   * @returns {Promise<void>}
   */
  async close() {
    return new Promise((resolve) => {
      this.client.quit(() => {
        logger.info('Kết nối Redis đã đóng');
        this.isConnected = false;
        resolve();
      });
    });
  }
}

module.exports = new RedisCache();
