/**
 * Product Service
 * Xử lý tất cả logic nghiệp vụ liên quan đến sản phẩm
 */

const productRepository = require('../../data/repositories/productRepository');
const categoryRepository = require('../../data/repositories/categoryRepository');
const reviewRepository = require('../../data/repositories/reviewRepository');
const ProductDTO = require('../../data/dto/productDTO');
const ApiFeatures = require('../../utils/apiFeatures');
const AppError = require('../../common/errors/apiError');
const { redisClient } = require('../cache/redisCache');
const { formatProductResponse } = require('../../common/utils/formatters');
const { validateProductData } = require('../../common/validators/productValidator');

class ProductService {
  constructor() {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.reviewRepository = reviewRepository;
    this.cacheExpiry = 3600; // 1 giờ
  }

  /**
   * Xử lý lỗi chung cho tất cả các phương thức
   * @param {Error} error - Lỗi cần xử lý
   * @param {string} defaultMessage - Thông báo mặc định nếu không phải AppError
   * @throws {AppError} - Ném lỗi đã được xử lý
   */
  handleError(error, defaultMessage) {
    console.error(`Error in ProductService: ${error.message}`, error);
    if (error instanceof AppError) throw error;
    throw new AppError(defaultMessage, 500);
  }

  /**
   * Quản lý cache
   * @param {string} key - Khóa cache
   * @param {number} expiry - Thời gian hết hạn (giây)
   * @param {Function} dataFn - Hàm lấy dữ liệu nếu cache miss
   * @returns {Promise<any>} - Dữ liệu từ cache hoặc từ hàm dataFn
   */
  async withCache(key, expiry, dataFn) {
    try {
      // Kiểm tra cache
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        console.log(`Cache hit for ${key}`);
        return JSON.parse(cachedData);
      }

      // Cache miss, lấy dữ liệu mới
      const data = await dataFn();

      // Lưu vào cache
      await redisClient.setex(key, expiry || this.cacheExpiry, JSON.stringify(data));

      return data;
    } catch (error) {
      console.error(`Cache error for ${key}:`, error);
      // Nếu có lỗi cache, vẫn trả về dữ liệu
      return await dataFn();
    }
  }

  /**
   * Xóa cache theo pattern
   * @param {string} pattern - Pattern của khóa cache cần xóa
   */
  async invalidateCache(pattern) {
    try {
      if (pattern.includes('*')) {
        // Xóa theo pattern
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`Invalidated ${keys.length} cache keys matching ${pattern}`);
        }
      } else {
        // Xóa một khóa cụ thể
        await redisClient.del(pattern);
        console.log(`Invalidated cache key: ${pattern}`);
      }
    } catch (error) {
      console.error(`Error invalidating cache ${pattern}:`, error);
      // Không ném lỗi, chỉ ghi log
    }
  }

  /**
   * Lấy danh sách sản phẩm với bộ lọc và phân trang
   * @param {Object} queryParams - Các tham số truy vấn
   * @returns {Promise<{products: Array, totalCount: Number, pagination: Object}>}
   */
  async getProducts(queryParams) {
    try {
      // Tạo khóa cache dựa trên tham số truy vấn
      const cacheKey = `products:${JSON.stringify(queryParams)}`;

      return await this.withCache(cacheKey, this.cacheExpiry, async () => {
        // Tạo đối tượng ApiFeatures để xử lý phân trang, sắp xếp và lọc
        const features = new ApiFeatures(this.productRepository.query(), queryParams)
          .filter()
          .sort()
          .limitFields()
          .paginate();

        // Thực hiện truy vấn
        const products = await features.query;
        const totalCount = await this.productRepository.countDocuments(features.getFilterObject());

        // Chuyển đổi thành DTO
        const productDTOs = products.map((product) => new ProductDTO(product).toJSON());

        // Định dạng phản hồi sản phẩm trước khi trả về
        const formattedProducts = productDTOs.map((product) => formatProductResponse(product));

        // Kết quả trả về
        return {
          products: formattedProducts,
          totalCount,
          pagination: features.getPaginationData(totalCount),
        };
      });
    } catch (error) {
      this.handleError(error, 'Không thể lấy danh sách sản phẩm');
    }
  }

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {string} productId - ID của sản phẩm
   * @returns {Promise<Object>} - Thông tin chi tiết sản phẩm
   */
  async getProductById(productId) {
    try {
      const cacheKey = `product:${productId}`;

      return await this.withCache(cacheKey, this.cacheExpiry, async () => {
        // Lấy thông tin sản phẩm từ repository
        const product = await this.productRepository.findById(productId);

        if (!product) {
          throw new AppError('Không tìm thấy sản phẩm', 404);
        }

        // Lấy thêm thông tin đánh giá
        const reviews = await this.reviewRepository.findByProductId(productId);

        // Kết hợp thông tin
        const productDTO = new ProductDTO(product).toJSON();
        productDTO.reviews = reviews;
        productDTO.averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        // Lấy thông tin danh mục
        if (product.categories && product.categories.length) {
          productDTO.categoryDetails = await this.categoryRepository.findByIds(product.categories);
        }

        // Định dạng phản hồi sản phẩm trước khi trả về
        return formatProductResponse(productDTO);
      });
    } catch (error) {
      this.handleError(error, 'Không thể lấy thông tin chi tiết sản phẩm');
    }
  }

  /**
   * Tạo sản phẩm mới
   * @param {Object} productData - Dữ liệu sản phẩm
   * @param {String} userId - ID của người dùng tạo sản phẩm
   * @returns {Promise<Object>} - Sản phẩm đã được tạo
   */
  async createProduct(productData, userId) {
    try {
      // Xác thực dữ liệu
      const { error } = validateProductData(productData);
      if (error) {
        throw new AppError(`Dữ liệu không hợp lệ: ${error.message}`, 400);
      }

      // Kiểm tra danh mục tồn tại
      if (productData.categories && productData.categories.length) {
        const validCategories = await this.categoryRepository.findByIds(productData.categories);
        if (validCategories.length !== productData.categories.length) {
          throw new AppError('Một hoặc nhiều danh mục không tồn tại', 400);
        }
      }

      // Tạo slug từ tên sản phẩm
      productData.slug = this.createSlugFromName(productData.name);

      // Thêm thông tin người tạo và ngày tạo
      productData.createdBy = userId;
      productData.createdAt = new Date();
      productData.updatedAt = new Date();

      // Lưu vào cơ sở dữ liệu
      const newProduct = await this.productRepository.create(productData);

      // Xóa các cache liên quan
      await this.invalidateCache('products:*');

      // Định dạng phản hồi sản phẩm trước khi trả về
      return formatProductResponse(new ProductDTO(newProduct).toJSON());
    } catch (error) {
      this.handleError(error, 'Không thể tạo sản phẩm mới');
    }
  }

  /**
   * Cập nhật sản phẩm
   * @param {string} productId - ID sản phẩm
   * @param {Object} updateData - Dữ liệu cập nhật
   * @param {String} userId - ID người dùng thực hiện cập nhật
   * @returns {Promise<Object>} - Sản phẩm đã được cập nhật
   */
  async updateProduct(productId, updateData, userId) {
    try {
      // Kiểm tra sản phẩm tồn tại
      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        throw new AppError('Không tìm thấy sản phẩm', 404);
      }

      // Xác thực dữ liệu cập nhật
      if (Object.keys(updateData).length > 0) {
        const { error } = validateProductData(updateData, true);
        if (error) {
          throw new AppError(`Dữ liệu cập nhật không hợp lệ: ${error.message}`, 400);
        }
      }

      // Kiểm tra danh mục tồn tại nếu được cập nhật
      if (updateData.categories && updateData.categories.length) {
        const validCategories = await this.categoryRepository.findByIds(updateData.categories);
        if (validCategories.length !== updateData.categories.length) {
          throw new AppError('Một hoặc nhiều danh mục không tồn tại', 400);
        }
      }

      // Cập nhật slug nếu tên được thay đổi
      if (updateData.name) {
        updateData.slug = this.createSlugFromName(updateData.name);
      }

      // Thêm thông tin người cập nhật và ngày cập nhật
      updateData.updatedBy = userId;
      updateData.updatedAt = new Date();

      // Cập nhật trong cơ sở dữ liệu
      const updatedProduct = await this.productRepository.findByIdAndUpdate(productId, updateData);

      // Xóa cache
      await this.invalidateCache(`product:${productId}`);
      await this.invalidateCache('products:*');

      // Định dạng phản hồi sản phẩm trước khi trả về
      return formatProductResponse(new ProductDTO(updatedProduct).toJSON());
    } catch (error) {
      this.handleError(error, 'Không thể cập nhật sản phẩm');
    }
  }

  /**
   * Xóa sản phẩm
   * @param {string} productId - ID sản phẩm
   * @returns {Promise<Boolean>} - Kết quả xóa
   */
  async deleteProduct(productId) {
    try {
      // Kiểm tra sản phẩm tồn tại
      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        throw new AppError('Không tìm thấy sản phẩm', 404);
      }

      // Kiểm tra sản phẩm có trong đơn hàng không
      // TODO: Add this check when OrderRepository is available

      // Xóa sản phẩm
      await this.productRepository.findByIdAndDelete(productId);

      // Xóa các đánh giá của sản phẩm
      await this.reviewRepository.deleteByProductId(productId);

      // Xóa cache
      await this.invalidateCache(`product:${productId}`);
      await this.invalidateCache('products:*');

      return true;
    } catch (error) {
      this.handleError(error, 'Không thể xóa sản phẩm');
    }
  }

  /**
   * Cập nhật số lượng tồn kho
   * @param {string} productId - ID sản phẩm
   * @param {number} quantity - Số lượng cập nhật
   * @returns {Promise<Object>} - Thông tin tồn kho đã cập nhật
   */
  async updateStock(productId, quantity) {
    try {
      if (isNaN(quantity)) {
        throw new AppError('Số lượng phải là số', 400);
      }

      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new AppError('Không tìm thấy sản phẩm', 404);
      }

      // Cập nhật tồn kho
      const updatedProduct = await this.productRepository.findByIdAndUpdate(productId, {
        stock: quantity,
        updatedAt: new Date(),
      });

      // Xóa cache
      await this.invalidateCache(`product:${productId}`);

      // Sử dụng updatedProduct để trả về thông tin cập nhật
      const stockInfo = {
        productId,
        name: updatedProduct.name,
        stock: updatedProduct.stock,
        status: updatedProduct.stock > 0 ? 'Còn hàng' : 'Hết hàng',
      };

      // Định dạng phản hồi trước khi trả về
      return formatProductResponse(stockInfo);
    } catch (error) {
      this.handleError(error, 'Không thể cập nhật tồn kho');
    }
  }

  /**
   * Lấy sản phẩm nổi bật
   * @param {number} limit - Số lượng sản phẩm trả về
   * @returns {Promise<Array>} - Danh sách sản phẩm nổi bật
   */
  async getTrendingProducts(limit = 10) {
    try {
      const cacheKey = `products:trending:${limit}`;

      return await this.withCache(cacheKey, this.cacheExpiry, async () => {
        // Thực hiện truy vấn
        const trending = await this.productRepository.getTrendingProducts(limit);

        // Chuyển đổi thành DTO và định dạng phản hồi
        return trending.map((product) => formatProductResponse(new ProductDTO(product).toJSON()));
      });
    } catch (error) {
      this.handleError(error, 'Không thể lấy danh sách sản phẩm nổi bật');
    }
  }

  /**
   * Lấy sản phẩm theo danh mục
   * @param {string} categoryId - ID danh mục
   * @param {Object} queryParams - Các tham số truy vấn
   * @returns {Promise<Object>} - Danh sách sản phẩm và thông tin phân trang
   */
  async getProductsByCategory(categoryId, queryParams) {
    try {
      // Kiểm tra danh mục tồn tại
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new AppError('Không tìm thấy danh mục', 404);
      }

      // Tạo khóa cache
      const cacheKey = `products:category:${categoryId}:${JSON.stringify(queryParams)}`;

      return await this.withCache(cacheKey, this.cacheExpiry, async () => {
        // Thêm bộ lọc danh mục
        const categoryFilter = { categories: categoryId };
        const mergedQuery = { ...queryParams, ...categoryFilter };

        // Tạo đối tượng ApiFeatures
        const features = new ApiFeatures(this.productRepository.query(), mergedQuery)
          .filter()
          .sort()
          .limitFields()
          .paginate();

        // Thực hiện truy vấn
        const products = await features.query;
        const totalCount = await this.productRepository.countDocuments(features.getFilterObject());

        // Chuyển đổi thành DTO và định dạng phản hồi
        const productDTOs = products.map((product) =>
          formatProductResponse(new ProductDTO(product).toJSON())
        );

        // Thêm thông tin danh mục
        return {
          category: {
            id: category._id,
            name: category.name,
            description: category.description,
          },
          products: productDTOs,
          totalCount,
          pagination: features.getPaginationData(totalCount),
        };
      });
    } catch (error) {
      this.handleError(error, 'Không thể lấy danh sách sản phẩm theo danh mục');
    }
  }

  /**
   * Tìm kiếm sản phẩm
   * @param {string} query - Từ khóa tìm kiếm
   * @param {Object} options - Các tùy chọn tìm kiếm
   * @returns {Promise<Object>} - Kết quả tìm kiếm
   */
  async searchProducts(query, options = {}) {
    try {
      if (!query || query.trim() === '') {
        throw new AppError('Từ khóa tìm kiếm không được để trống', 400);
      }

      // Tạo khóa cache
      const cacheKey = `products:search:${query}:${JSON.stringify(options)}`;

      return await this.withCache(cacheKey, this.cacheExpiry, async () => {
        // Tạo truy vấn tìm kiếm
        const searchOptions = {
          query,
          limit: options.limit || 10,
          page: options.page || 1,
          sort: options.sort || { relevance: -1 },
          filters: options.filters || {},
        };

        // Thực hiện tìm kiếm
        const searchResults = await this.productRepository.search(searchOptions);

        // Chuyển đổi thành DTO và định dạng phản hồi
        const productDTOs = searchResults.products.map((product) =>
          formatProductResponse(new ProductDTO(product).toJSON())
        );

        // Kết quả tìm kiếm
        return {
          products: productDTOs,
          totalCount: searchResults.total,
          pagination: {
            currentPage: searchOptions.page,
            pageSize: searchOptions.limit,
            totalPages: Math.ceil(searchResults.total / searchOptions.limit),
          },
        };
      });
    } catch (error) {
      this.handleError(error, 'Không thể tìm kiếm sản phẩm');
    }
  }

  /**
   * Tạo slug từ tên sản phẩm
   * @param {string} name - Tên sản phẩm
   * @returns {string} - Slug đã tạo
   */
  createSlugFromName(name) {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  /**
   * Cập nhật số lượng xem sản phẩm
   * @param {string} productId - ID sản phẩm
   * @returns {Promise<void>}
   */
  async incrementViewCount(productId) {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new AppError('Không tìm thấy sản phẩm', 404);
      }

      // Tăng số lượt xem
      await this.productRepository.findByIdAndUpdate(productId, {
        $inc: { viewCount: 1 },
        updatedAt: new Date(),
      });

      // Không cần xóa cache vì thông tin này không quan trọng để invalidate cache ngay lập tức
    } catch (error) {
      // Chỉ ghi log lỗi, không ném lỗi vì đây không phải thao tác quan trọng
      console.error(`Error incrementing view count for product ${productId}:`, error);
    }
  }

  /**
   * Lấy sản phẩm liên quan
   * @param {string} productId - ID sản phẩm
   * @param {number} limit - Số lượng sản phẩm trả về
   * @returns {Promise<Array>} - Danh sách sản phẩm liên quan
   */
  async getRelatedProducts(productId, limit = 5) {
    try {
      const cacheKey = `products:related:${productId}:${limit}`;

      return await this.withCache(cacheKey, this.cacheExpiry, async () => {
        // Lấy thông tin sản phẩm
        const product = await this.productRepository.findById(productId);
        if (!product) {
          throw new AppError('Không tìm thấy sản phẩm', 404);
        }

        // Lấy sản phẩm cùng danh mục
        const relatedProducts = await this.productRepository.findRelated(
          productId,
          product.categories,
          limit
        );

        // Chuyển đổi thành DTO và định dạng phản hồi
        return relatedProducts.map((product) =>
          formatProductResponse(new ProductDTO(product).toJSON())
        );
      });
    } catch (error) {
      this.handleError(error, 'Không thể lấy danh sách sản phẩm li��n quan');
    }
  }
}

module.exports = new ProductService();
