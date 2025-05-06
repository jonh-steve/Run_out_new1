// server/src/data/dto/productDTO.js

/**
 * ProductDTO
 * Đối tượng chuyển đổi dữ liệu cho sản phẩm
 */
class ProductDTO {
  /**
   * Khởi tạo đối tượng ProductDTO
   * @param {Object} product - Đối tượng sản phẩm từ database
   */
  constructor(product) {
    this.product = product;

    if (product) {
      this.id = product._id;
      this.name = product.name;
      this.slug = product.slug;
      this.description = product.description;
      this.detailedDescription = product.detailedDescription;
      this.price = product.price;
      this.salePrice = product.salePrice;
      this.currency = product.currency || 'VND';
      this.stock = product.stock;
      this.categories = product.categories;
      this.images = product.images;
      this.attributes = product.attributes;
      this.status = product.status;
      this.featured = product.featured;
      this.sku = product.sku;
      this.brand = product.brand;
      this.createdAt = product.createdAt;
      this.updatedAt = product.updatedAt;
    }
  }

  /**
   * Tạo DTO từ entity
   * @param {Object} product - Entity sản phẩm
   * @returns {ProductDTO} - Đối tượng DTO
   */
  static fromEntity(product) {
    return new ProductDTO(product);
  }

  /**
   * Tạo danh sách DTO từ danh sách entity
   * @param {Array} products - Danh sách entity sản phẩm
   * @returns {Array} - Danh sách DTO
   */
  static fromEntities(products) {
    return products.map((product) => ProductDTO.fromEntity(product));
  }

  /**
   * Chuyển đổi DTO thành entity
   * @param {ProductDTO} dto - Đối tượng DTO
   * @returns {Object} - Entity sản phẩm
   */
  static toEntity(dto) {
    const entity = { ...dto };
    delete entity.id;
    return entity;
  }

  /**
   * Chuyển đổi đối tượng sản phẩm thành JSON
   * @returns {Object} - Đối tượng JSON chứa thông tin sản phẩm
   */
  toJSON() {
    if (!this.product) return null;

    // Lấy dữ liệu từ đối tượng sản phẩm
    const {
      _id,
      name,
      slug,
      description,
      detailedDescription,
      price,
      salePrice,
      currency,
      stock,
      categories,
      images,
      attributes,
      status,
      featured,
      sku,
      brand,
      weight,
      dimensions,
      tags,
      warranty,
      soldCount,
      viewCount,
      createdAt,
      updatedAt,
    } = this.product;

    // Biến đổi dữ liệu
    return {
      id: _id.toString(),
      name,
      slug,
      description,
      detailedDescription,
      pricing: {
        regular: price,
        sale: salePrice > 0 && salePrice < price ? salePrice : null,
        currency: currency || 'VND',
        discount: this._calculateDiscount(price, salePrice),
        finalPrice: this._getFinalPrice(price, salePrice),
      },
      inventory: {
        stock,
        inStock: stock > 0,
        status: stock > 0 ? 'Còn hàng' : 'Hết hàng',
      },
      categories: Array.isArray(categories)
        ? categories.map((cat) =>
            typeof cat === 'object' && cat._id ? cat._id.toString() : cat.toString()
          )
        : [],
      images: this._formatImages(images),
      mainImage: this._getMainImage(images),
      attributes: attributes || [],
      status,
      featured,
      sku,
      brand,
      specifications: {
        weight: weight || null,
        dimensions: dimensions || null,
      },
      tags: tags || [],
      warranty: warranty || null,
      stats: {
        soldCount: soldCount || 0,
        viewCount: viewCount || 0,
      },
      dates: {
        created: createdAt,
        updated: updatedAt,
      },
    };
  }

  /**
   * Tạo DTO cho danh sách sản phẩm
   * @param {Array} products - Danh sách sản phẩm
   * @returns {Array} - Danh sách DTO
   */
  static toJSONList(products) {
    if (!Array.isArray(products)) return [];
    return products.map((product) => new ProductDTO(product).toJSON());
  }

  /**
   * Tạo phiên bản rút gọn của DTO cho hiển thị trong danh sách
   * @returns {Object} - Đối tượng JSON rút gọn
   */
  toSummaryJSON() {
    if (!this.product) return null;

    const {
      _id,
      name,
      slug,
      description,
      price,
      salePrice,
      stock,
      images,
      status,
      featured,
      soldCount,
      createdAt,
    } = this.product;

    return {
      id: _id.toString(),
      name,
      slug,
      shortDescription: this._truncateText(description, 100),
      pricing: {
        regular: price,
        sale: salePrice > 0 && salePrice < price ? salePrice : null,
        discount: this._calculateDiscount(price, salePrice),
        finalPrice: this._getFinalPrice(price, salePrice),
      },
      inStock: stock > 0,
      mainImage: this._getMainImage(images),
      status,
      featured,
      soldCount: soldCount || 0,
      createdAt,
    };
  }

  /**
   * Tạo phiên bản chi tiết đầy đủ, bao gồm cả đánh giá và danh mục
   * @param {Array} reviews - Danh sách đánh giá
   * @param {Array} categoryDetails - Thông tin chi tiết danh mục
   * @returns {Object} - Đối tượng JSON chi tiết
   */
  toDetailedJSON(reviews = [], categoryDetails = []) {
    const baseDTO = this.toJSON();

    // Thêm thông tin đánh giá
    baseDTO.reviews = reviews;
    baseDTO.averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    // Thêm thông tin chi tiết danh mục
    baseDTO.categoryDetails = categoryDetails;

    // Thêm sản phẩm liên quan nếu có
    if (this.relatedProducts) {
      baseDTO.relatedProducts = this.relatedProducts;
    }

    return baseDTO;
  }

  /**
   * Thiết lập sản phẩm liên quan
   * @param {Array} relatedProducts - Danh sách sản phẩm liên quan
   */
  setRelatedProducts(relatedProducts) {
    this.relatedProducts = ProductDTO.toJSONList(relatedProducts);
    return this;
  }

  /**
   * Tính phần trăm giảm giá
   * @param {Number} price - Giá gốc
   * @param {Number} salePrice - Giá khuyến mãi
   * @returns {Number} - Phần trăm giảm giá
   * @private
   */
  _calculateDiscount(price, salePrice) {
    if (salePrice && salePrice > 0 && salePrice < price) {
      return Math.round(((price - salePrice) / price) * 100);
    }
    return 0;
  }

  /**
   * Lấy giá cuối cùng (sau giảm giá nếu có)
   * @param {Number} price - Giá gốc
   * @param {Number} salePrice - Giá khuyến mãi
   * @returns {Number} - Giá cuối cùng
   * @private
   */
  _getFinalPrice(price, salePrice) {
    if (salePrice && salePrice > 0 && salePrice < price) {
      return salePrice;
    }
    return price;
  }

  /**
   * Định dạng danh sách hình ảnh
   * @param {Array} images - Danh sách hình ảnh
   * @returns {Array} - Danh sách hình ảnh đã định dạng
   * @private
   */
  _formatImages(images) {
    if (!images || !Array.isArray(images)) return [];

    return images.map((image) => {
      // Nếu image là string (url)
      if (typeof image === 'string') {
        return {
          url: image,
          alt: this.product.name,
          isMain: false,
        };
      }

      // Nếu image là object
      return {
        url: image.url,
        alt: image.alt || this.product.name,
        isMain: !!image.isMain,
      };
    });
  }

  /**
   * Lấy hình ảnh chính của sản phẩm
   * @param {Array} images - Danh sách hình ảnh
   * @returns {String} - URL hình ảnh chính
   * @private
   */
  _getMainImage(images) {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null;
    }

    // Tìm hình ảnh được đánh dấu là chính
    const mainImage = images.find((img) => {
      if (typeof img === 'object' && img.isMain) {
        return true;
      }
      return false;
    });

    // Nếu có hình ảnh chính, trả về URL
    if (mainImage) {
      return typeof mainImage === 'string' ? mainImage : mainImage.url;
    }

    // Nếu không có hình ảnh chính, lấy hình ảnh đầu tiên
    const firstImage = images[0];
    return typeof firstImage === 'string' ? firstImage : firstImage.url;
  }

  /**
   * Cắt ngắn văn bản
   * @param {String} text - Văn bản
   * @param {Number} maxLength - Độ dài tối đa
   * @returns {String} - Văn bản đã cắt ngắn
   * @private
   */
  _truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
  }
}

module.exports = ProductDTO;
