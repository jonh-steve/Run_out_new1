/**
 * Class xử lý các tính năng API như filtering, sorting, pagination
 */
class APIFeatures {
  /**
   * @param {Object} query - Mongoose query object
   * @param {Object} queryString - Query string từ Express request
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Filter query dựa trên các tham số
   * Hỗ trợ các operators: gt, gte, lt, lte, in
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'q', 'populate'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering với gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sắp xếp kết quả
   * Format: sort=field,direction (ví dụ: sort=price,-createdAt)
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort theo createdAt giảm dần (mới nhất trước)
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Giới hạn các trường được trả về
   * Format: fields=field1,field2,-field3
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Mặc định bỏ trường __v
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Phân trang kết quả
   * page: Số trang (default: 1)
   * limit: Số items mỗi trang (default: 10)
   */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Populate các trường reference
   * Format: populate=field1,field2
   */
  populate() {
    if (this.queryString.populate) {
      const fields = this.queryString.populate.split(',');
      fields.forEach((field) => {
        this.query = this.query.populate(field);
      });
    }
    return this;
  }

  /**
   * Search dựa trên text index
   * Format: q=search term
   */
  search() {
    if (this.queryString.q) {
      this.query = this.query.find({ $text: { $search: this.queryString.q } });
    }
    return this;
  }
}

module.exports = APIFeatures;
