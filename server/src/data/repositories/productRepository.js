// server/src/data/repositories/productRepository.js
const Product = require('../models/product.model');
const ApiError = require('../../common/errors/apiError');
const mongoose = require('mongoose');
const redisCache = require('../../services/cache/redisCache'); // Thay thế bằng RedisCache
const logger = require('../../utils/logger'); // Giả định có module logger

class ProductRepository {
  constructor() {
    // Prefix cho cache keys
    this.cachePrefix = 'products';
    // Thời gian cache mặc định (5 phút)
    this.defaultCacheTTL = 300;
  }

  /**
   * Tìm tất cả sản phẩm với phân trang và lọc
   * @param {Object} filter - Bộ lọc
   * @param {Object} options - Tùy chọn
   * @returns {Object} - Kết quả với phân trang
   */
  async findAll(filter = {}, options = {}) {
    const cacheKey = redisCache.generateKey(`${this.cachePrefix}:all`, { filter, options });

    // Kiểm tra cache
    const cachedResult = await redisCache.get(cacheKey);
    if (cachedResult) {
      logger.info(`Lấy dữ liệu từ cache: ${cacheKey}`);
      return cachedResult;
    }

    const { sort = { createdAt: -1 }, limit = 50, page = 1, populate = [] } = options;
    const skip = (page - 1) * limit;

    const query = Product.find(filter).sort(sort).skip(skip).limit(limit);

    if (populate.length > 0) {
      query.populate(populate);
    }

    try {
      const [products, totalCount] = await Promise.all([
        query.lean().exec(), // Sử dụng lean() để tăng hiệu suất
        Product.countDocuments(filter),
      ]);

      const result = {
        data: products,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      };

      // Lưu vào cache
      await redisCache.set(cacheKey, result, this.defaultCacheTTL);

      return result;
    } catch (error) {
      logger.error('Lỗi khi tìm tất cả sản phẩm:', error);
      throw error;
    }
  }

  /**
   * Tìm sản phẩm theo ID
   * @param {string} id - ID sản phẩm
   * @param {Object} options - Tùy chọn
   * @returns {Object} - Sản phẩm
   */
  async findById(id, options = {}) {
    const cacheKey = redisCache.generateKey(`${this.cachePrefix}:id`, { id, options });

    // Kiểm tra cache
    const cachedProduct = await redisCache.get(cacheKey);
    if (cachedProduct) {
      logger.info(`Lấy sản phẩm từ cache: ${cacheKey}`);
      return cachedProduct;
    }

    const { populate = [] } = options;

    const query = Product.findById(id);

    if (populate.length > 0) {
      query.populate(populate);
    }

    try {
      const product = await query.lean().exec();

      if (!product) {
        throw ApiError.notFound('Không tìm thấy sản phẩm');
      }

      // Lưu vào cache
      await redisCache.set(cacheKey, product, this.defaultCacheTTL);

      return product;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Lỗi khi tìm sản phẩm theo ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tìm sản phẩm theo slug
   * @param {string} slug - Slug sản phẩm
   * @param {Object} options - Tùy chọn
   * @returns {Object} - Sản phẩm
   */
  async findBySlug(slug, options = {}) {
    const cacheKey = redisCache.generateKey(`${this.cachePrefix}:slug`, { slug, options });

    // Kiểm tra cache
    const cachedProduct = await redisCache.get(cacheKey);
    if (cachedProduct) {
      logger.info(`Lấy sản phẩm từ cache: ${cacheKey}`);
      return cachedProduct;
    }

    const { populate = [] } = options;

    const query = Product.findOne({ slug });

    if (populate.length > 0) {
      query.populate(populate);
    }

    try {
      const product = await query.lean().exec();

      if (!product) {
        throw ApiError.notFound('Không tìm thấy sản phẩm');
      }

      // Lưu vào cache
      await redisCache.set(cacheKey, product, this.defaultCacheTTL);

      return product;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Lỗi khi tìm sản phẩm theo slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Tạo sản phẩm mới
   * @param {Object} data - Dữ liệu sản phẩm
   * @returns {Object} - Sản phẩm đã tạo
   */
  async create(data) {
    try {
      const product = new Product(data);
      const savedProduct = await product.save();

      // Xóa cache liên quan đến danh sách sản phẩm
      await this.invalidateProductListCache();

      return savedProduct;
    } catch (error) {
      logger.error('Lỗi khi tạo sản phẩm:', error);
      throw error;
    }
  }

  /**
   * Cập nhật sản phẩm
   * @param {string} id - ID sản phẩm
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Object} - Sản phẩm đã cập nhật
   */
  async update(id, data) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { ...data, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!product) {
        throw ApiError.notFound('Không tìm thấy sản phẩm');
      }

      // Xóa cache của sản phẩm này
      await this.invalidateProductCache(id, product.slug);

      return product;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Lỗi khi cập nhật sản phẩm ${id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa sản phẩm
   * @param {string} id - ID sản phẩm
   * @returns {Object} - Kết quả xóa
   */
  async delete(id) {
    try {
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        throw ApiError.notFound('Không tìm thấy sản phẩm');
      }

      // Xóa cache của sản phẩm này và danh sách sản phẩm
      await this.invalidateProductCache(id, product.slug);
      await this.invalidateProductListCache();

      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Lỗi khi xóa sản phẩm ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tìm kiếm sản phẩm theo text
   * @param {string} query - Từ khóa tìm kiếm
   * @param {Object} options - Tùy chọn
   * @returns {Object} - Kết quả tìm kiếm với phân trang
   */
  async searchProducts(query, options = {}) {
    const cacheKey = redisCache.generateKey(`${this.cachePrefix}:search`, { query, options });

    // Kiểm tra cache
    const cachedResult = await redisCache.get(cacheKey);
    if (cachedResult) {
      logger.info(`Lấy kết quả tìm kiếm từ cache: ${cacheKey}`);
      return cachedResult;
    }

    const { sort = { score: { $meta: 'textScore' } }, limit = 50, page = 1 } = options;
    const skip = (page - 1) * limit;

    const textSearchQuery = {
      $text: { $search: query },
      isActive: true,
    };

    try {
      const [products, totalCount] = await Promise.all([
        Product.find(textSearchQuery, { score: { $meta: 'textScore' } })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Product.countDocuments(textSearchQuery),
      ]);

      const result = {
        data: products,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      };

      // Lưu vào cache với thời gian ngắn hơn (2 phút) vì dữ liệu tìm kiếm thường thay đổi
      await redisCache.set(cacheKey, result, 120);

      return result;
    } catch (error) {
      logger.error(`Lỗi khi tìm kiếm sản phẩm với từ khóa "${query}":`, error);
      throw error;
    }
  }

  /**
   * Cập nhật đánh giá sản phẩm
   * @param {string} productId - ID sản phẩm
   * @param {Object} rating - Thông tin đánh giá
   * @returns {Object} - Sản phẩm đã cập nhật
   */
  async updateRating(productId, rating) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { ratings: rating },
        { new: true }
      );

      if (product) {
        // Xóa cache của sản phẩm này
        await this.invalidateProductCache(productId, product.slug);
      }

      return product;
    } catch (error) {
      logger.error(`Lỗi khi cập nhật đánh giá sản phẩm ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Tìm sản phẩm với các bộ lọc và hỗ trợ cache
   * @param {Object} filters - Các bộ lọc để tìm sản phẩm
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Object} - Kết quả tìm kiếm với phân trang
   */
  async findWithFilters(filters, options = {}) {
    // Tạo cache key dựa trên filters và options
    const cacheKey = redisCache.generateKey(`${this.cachePrefix}:filters`, { filters, options });

    // Kiểm tra cache trước
    const cachedResult = await redisCache.get(cacheKey);
    if (cachedResult) {
      logger.info(`Lấy kết quả lọc từ cache: ${cacheKey}`);
      return cachedResult;
    }

    const {
      category,
      minPrice,
      maxPrice,
      brand,
      sort = { createdAt: -1 },
      page = 1,
      limit = 20,
    } = filters;

    // Xây dựng query criteria
    const criteria = { isActive: true };

    if (category) {
      criteria.category = mongoose.Types.ObjectId(category);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      criteria.price = {};
      if (minPrice !== undefined) criteria.price.$gte = minPrice;
      if (maxPrice !== undefined) criteria.price.$lte = maxPrice;
    }

    if (brand) {
      criteria.brand = brand;
    }

    // Sử dụng projection để giảm kích thước response
    const projection = options.projection || {
      name: 1,
      slug: 1,
      price: 1,
      category: 1,
      brand: 1,
      images: { $slice: 1 }, // Chỉ lấy ảnh đầu tiên
      ratings: 1,
    };

    // Tính toán skip value cho pagination
    const skip = (page - 1) * limit;

    try {
      // Thực hiện query với tối ưu
      const products = await Product.find(criteria, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(); // Sử dụng lean() để tăng hiệu suất

      // Đếm tổng số sản phẩm (sử dụng countDocuments thay vì count)
      const total = await Product.countDocuments(criteria);

      const result = {
        data: products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };

      // Lưu kết quả vào cache (TTL 5 phút)
      await redisCache.set(cacheKey, result, this.defaultCacheTTL);

      return result;
    } catch (error) {
      logger.error('Lỗi khi tìm sản phẩm với bộ lọc:', error);
      throw error;
    }
  }

  /**
   * Xóa cache của một sản phẩm cụ thể
   * @param {string} id - ID sản phẩm
   * @param {string} slug - Slug sản phẩm
   * @returns {Promise<void>}
   */
  async invalidateProductCache(id, slug) {
    try {
      // Xóa cache theo ID
      await redisCache.deleteByPattern(`${this.cachePrefix}:id:*${id}*`);

      // Xóa cache theo slug nếu có
      if (slug) {
        await redisCache.deleteByPattern(`${this.cachePrefix}:slug:*${slug}*`);
      }

      logger.info(`Đã xóa cache cho sản phẩm: ${id}`);
    } catch (error) {
      logger.error(`Lỗi khi xóa cache sản phẩm ${id}:`, error);
    }
  }

  /**
   * Xóa cache của danh sách sản phẩm
   * @returns {Promise<void>}
   */
  async invalidateProductListCache() {
    try {
      // Xóa tất cả cache liên quan đến danh sách sản phẩm
      await redisCache.deleteByPattern(`${this.cachePrefix}:all:*`);
      await redisCache.deleteByPattern(`${this.cachePrefix}:filters:*`);
      await redisCache.deleteByPattern(`${this.cachePrefix}:search:*`);

      logger.info('Đã xóa cache danh sách sản phẩm');
    } catch (error) {
      logger.error('Lỗi khi xóa cache danh sách sản phẩm:', error);
    }
  }

  /**
   * Lấy sản phẩm nổi bật
   * @param {number} limit - Số lượng sản phẩm cần lấy
   * @returns {Array} - Danh sách sản phẩm nổi bật
   */
  async getFeaturedProducts(limit = 10) {
    const cacheKey = redisCache.generateKey(`${this.cachePrefix}:featured`, { limit });

    // Kiểm tra cache
    const cachedProducts = await redisCache.get(cacheKey);
    if (cachedProducts) {
      logger.info(`Lấy sản phẩm nổi bật từ cache: ${cacheKey}`);
      return cachedProducts;
    }

    try {
      const products = await Product.find({
        isActive: true,
        isFeatured: true,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      // Lưu vào cache (TTL 1 giờ)
      await redisCache.set(cacheKey, products, 3600);

      return products;
    } catch (error) {
      logger.error('Lỗi khi lấy sản phẩm nổi bật:', error);
      throw error;
    }
  }

  /**
   * Lấy sản phẩm mới nhất
   * @param {number} limit - Số lượng sản phẩm cần lấy
   * @returns {Array} - Danh sách sản phẩm mới nhất
   */
  async getNewArrivals(limit = 10) {
    const cacheKey = redisCache.generateKey(`${this.cachePrefix}:new`, { limit });

    // Kiểm tra cache
    const cachedProducts = await redisCache.get(cacheKey);
    if (cachedProducts) {
      logger.info(`Lấy sản phẩm mới từ cache: ${cacheKey}`);
      return cachedProducts;
    }

    try {
      const products = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      // Lưu vào cache (TTL 30 phút)
      await redisCache.set(cacheKey, products, 1800);

      return products;
    } catch (error) {
      logger.error('Lỗi khi lấy sản phẩm mới nhất:', error);
      throw error;
    }
  }

  /**
   * Lấy sản phẩm bán chạy nhất
   * @param {number} limit - Số lượng sản phẩm cần lấy
   * @returns {Array} - Danh sách sản phẩm bán chạy
   */
  async getBestSellers(limit = 10) {
    const cacheKey = redisCache.generateKey(`${this.cachePrefix}:bestsellers`, { limit });

    // Kiểm tra cache
    const cachedProducts = await redisCache.get(cacheKey);
    if (cachedProducts) {
      logger.info(`Lấy sản phẩm bán chạy từ cache: ${cacheKey}`);
      return cachedProducts;
    }

    try {
      const products = await Product.find({ isActive: true })
        .sort({ soldCount: -1 })
        .limit(limit)
        .lean()
        .exec();

      // Lưu vào cache (TTL 1 giờ)
      await redisCache.set(cacheKey, products, 3600);

      return products;
    } catch (error) {
      logger.error('Lỗi khi lấy sản phẩm bán chạy:', error);
      throw error;
    }
  }
}

module.exports = new ProductRepository();
