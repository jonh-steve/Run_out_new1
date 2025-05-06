/**
 * API Features Utility - xử lý các tính năng API phổ biến như filtering, sorting, pagination
 * @author Steve
 * @project RunOut-Biliard
 *
 * @typedef {import('mongoose').Query<any, any>} MongooseQuery
 */

class APIFeatures {
  /**
   * Khởi tạo class với query và queryString
   * @param {MongooseQuery} query - Mongoose query ban đầu
   * @param {Object} queryString - Query parameters từ request
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Lọc dữ liệu theo các trường
   * @returns {APIFeatures} - Instance của class để chaining
   */
  filter() {
    // Tạo bản sao của query string
    const queryObj = { ...this.queryString };

    // Các trường loại trừ khỏi filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Xử lý advanced filtering (gt, gte, lt, lte, in, nin)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|nin)\b/g, (match) => `$${match}`);

    // Áp dụng filter vào query
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  /**
   * Thêm tìm kiếm text
   * @returns {APIFeatures} - Instance của class để chaining
   */
  search() {
    if (this.queryString.search) {
      // Tạo điều kiện tìm kiếm
      const searchQuery = {
        $or: [
          { name: { $regex: this.queryString.search, $options: 'i' } },
          { description: { $regex: this.queryString.search, $options: 'i' } },
        ],
      };

      // Áp dụng tìm kiếm vào query
      this.query = this.query.find(searchQuery);
    }

    return this;
  }

  /**
   * Sắp xếp kết quả
   * @returns {APIFeatures} - Instance của class để chaining
   */
  sort() {
    if (this.queryString.sort) {
      // Chuyển đổi chuỗi sort thành format cho MongoDB
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Mặc định sắp xếp theo thời gian tạo giảm dần
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  /**
   * Giới hạn các trường được trả về
   * @returns {APIFeatures} - Instance của class để chaining
   */
  limitFields() {
    if (this.queryString.fields) {
      // Chuyển đổi chuỗi fields thành format cho MongoDB
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Mặc định loại bỏ trường __v
      this.query = this.query.select('-__v');
    }

    return this;
  }

  /**
   * Phân trang kết quả
   * @returns {APIFeatures} - Instance của class để chaining
   */
  paginate() {
    // Chuyển đổi page và limit thành số
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Áp dụng skip và limit vào query
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  /**
   * Áp dụng tất cả các tính năng vào query
   * @returns {MongooseQuery} - Query đã được xử lý
   */
  build() {
    return this.filter().search().sort().limitFields().paginate().query;
  }
}

module.exports = APIFeatures;
