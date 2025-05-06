// src/utils/queryAnalyzer.js
// const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

/**
 * Lớp QueryAnalyzer cung cấp các công cụ để phân tích và tối ưu hóa truy vấn MongoDB
 */
class QueryAnalyzer {
  /**
   * Phân tích truy vấn find() và trả về thông tin chi tiết về hiệu suất
   * @param {mongoose.Model} model - Model Mongoose cần phân tích
   * @param {Object} query - Điều kiện truy vấn
   * @param {Object} options - Tùy chọn bổ sung (projection, sort, skip, limit)
   * @returns {Object} Kết quả phân tích truy vấn
   */
  static async analyzeQuery(model, query, options = {}) {
    // Ghi lại thời gian bắt đầu
    const startTime = Date.now();

    // Lấy explain plan cho truy vấn
    const explain = await model
      .find(query, options.projection)
      .sort(options.sort || {})
      .skip(options.skip || 0)
      .limit(options.limit || 10)
      .explain('executionStats');

    // Trích xuất thống kê thực thi
    const executionStats = explain.executionStats;
    const queryPlanner = explain.queryPlanner;

    // Phân tích kết quả
    const result = {
      collection: model.collection.name,
      queryShape: JSON.stringify(query),
      executionTimeMs: executionStats.executionTimeMillis,
      totalDocsExamined: executionStats.totalDocsExamined,
      totalKeysExamined: executionStats.totalKeysExamined,
      docsReturned: executionStats.nReturned,
      indexesUsed: this._getIndexesUsed(queryPlanner.winningPlan),
      isOptimal: this._isQueryOptimal(executionStats),
      recommendations: this.generateRecommendations(explain),
      actualExecutionTime: Date.now() - startTime,
    };

    // Ghi log nếu truy vấn chậm
    if (result.executionTimeMs > 100) {
      await this.logSlowQuery(result);
    }

    return result;
  }

  /**
   * Phân tích truy vấn aggregate và trả về thông tin chi tiết về hiệu suất
   * @param {mongoose.Model} model - Model Mongoose cần phân tích
   * @param {Array} pipeline - Pipeline aggregation
   * @returns {Object} Kết quả phân tích truy vấn
   */
  static async analyzeAggregate(model, pipeline) {
    const startTime = Date.now();

    // Thêm stage $explain vào cuối pipeline
    const explainPipeline = [...pipeline, { $explain: true }];
    const explainResults = await model.aggregate(explainPipeline).exec();

    // Phân tích kết quả từ explain
    const result = {
      collection: model.collection.name,
      pipeline: JSON.stringify(pipeline),
      executionTimeMs: explainResults[0]?.executionStats?.executionTimeMillis || 0,
      stages: this._analyzeAggregateStages(explainResults[0]),
      recommendations: this._generateAggregateRecommendations(explainResults[0]),
      actualExecutionTime: Date.now() - startTime,
    };

    // Ghi log nếu truy vấn chậm
    if (result.executionTimeMs > 200) {
      await this.logSlowQuery(result, 'aggregate');
    }

    return result;
  }

  /**
   * Phân tích các stage trong aggregate pipeline
   * @private
   * @param {Object} explainResult - Kết quả từ explain
   * @returns {Array} Thông tin về các stage
   */
  static _analyzeAggregateStages(explainResult) {
    if (!explainResult || !explainResult.stages) {
      return [];
    }

    return explainResult.stages.map((stage) => {
      const stageName = Object.keys(stage)[0];
      return {
        name: stageName,
        timeMs: stage[stageName]?.executionTimeMillisEstimate || 0,
      };
    });
  }

  /**
   * Tạo khuyến nghị cho truy vấn aggregate
   * @private
   * @param {Object} explainResult - Kết quả từ explain
   * @returns {Array} Danh sách khuyến nghị
   */
  static _generateAggregateRecommendations(explainResult) {
    const recommendations = [];

    if (!explainResult) return recommendations;

    // Kiểm tra các stage tốn nhiều thời gian
    if (explainResult.stages) {
      const expensiveStages = explainResult.stages
        .filter((stage) => {
          const stageName = Object.keys(stage)[0];
          return stage[stageName]?.executionTimeMillisEstimate > 100;
        })
        .map((stage) => Object.keys(stage)[0]);

      if (expensiveStages.length > 0) {
        recommendations.push(
          `Các stage tốn nhiều thời gian: ${expensiveStages.join(', ')}. Xem xét tối ưu hóa hoặc thêm chỉ mục.`
        );
      }
    }

    // Kiểm tra sử dụng $match sớm
    const pipelineStr = JSON.stringify(explainResult);
    if (
      !pipelineStr.includes('"$match"') ||
      pipelineStr.indexOf('"$match"') > pipelineStr.indexOf('"$project"')
    ) {
      recommendations.push(
        'Đặt $match càng sớm càng tốt trong pipeline để lọc dữ liệu trước khi xử lý.'
      );
    }

    return recommendations;
  }

  /**
   * Lấy danh sách các chỉ mục được sử dụng
   * @private
   * @param {Object} plan - Kế hoạch thực thi
   * @returns {String} Tên chỉ mục hoặc thông báo không sử dụng chỉ mục
   */
  static _getIndexesUsed(plan) {
    if (!plan) return 'Không có thông tin kế hoạch';

    // Kiểm tra nếu kế hoạch trực tiếp có chỉ mục
    if (plan.indexName) {
      return plan.indexName;
    }

    // Kiểm tra trong inputStage
    if (plan.inputStage?.indexName) {
      return plan.inputStage.indexName;
    }

    // Kiểm tra đệ quy trong inputStages (cho trường hợp OR hoặc AND)
    if (plan.inputStages) {
      const indexNames = plan.inputStages
        .map((stage) => this._getIndexesUsed(stage))
        .filter((name) => name !== 'No index used (COLLSCAN)');

      if (indexNames.length > 0) {
        return indexNames.join(', ');
      }
    }

    return 'No index used (COLLSCAN)';
  }

  /**
   * Kiểm tra xem truy vấn có tối ưu không
   * @private
   * @param {Object} stats - Thống kê thực thi
   * @returns {Boolean} Truy vấn có tối ưu không
   */
  static _isQueryOptimal(stats) {
    // Truy vấn được coi là tối ưu nếu:
    // 1. Số lượng tài liệu kiểm tra gần với số lượng tài liệu trả về
    // 2. Thời gian thực thi dưới ngưỡng (ví dụ: 50ms)
    return stats.totalDocsExamined <= stats.nReturned * 1.2 && stats.executionTimeMillis < 50;
  }

  /**
   * Tạo khuyến nghị dựa trên kết quả explain
   * @param {Object} explain - Kết quả từ explain()
   * @returns {Array} Danh sách khuyến nghị
   */
  static generateRecommendations(explain) {
    const recommendations = [];
    const executionStats = explain.executionStats;
    const queryPlanner = explain.queryPlanner;

    // Kiểm tra việc sử dụng chỉ mục
    const indexesUsed = this._getIndexesUsed(queryPlanner.winningPlan);
    if (indexesUsed === 'No index used (COLLSCAN)') {
      recommendations.push(
        'Truy vấn không sử dụng chỉ mục nào. Xem xét thêm chỉ mục cho mẫu truy vấn này.'
      );

      // Đề xuất chỉ mục cụ thể
      const suggestedIndex = this.suggestIndex(queryPlanner.parsedQuery);
      if (suggestedIndex) {
        recommendations.push(`Chỉ mục đề xuất: ${suggestedIndex}`);
      }
    }

    // Kiểm tra nếu kiểm tra quá nhiều tài liệu
    if (executionStats.totalDocsExamined > executionStats.nReturned * 3) {
      recommendations.push(
        'Truy vấn đang kiểm tra quá nhiều tài liệu so với số lượng trả về. Xem xét sử dụng chỉ mục chọn lọc hơn.'
      );
    }

    // Kiểm tra thời gian thực thi
    if (executionStats.executionTimeMillis > 100) {
      recommendations.push(
        'Thời gian thực thi truy vấn cao. Xem xét tối ưu hóa truy vấn hoặc thêm chỉ mục.'
      );
    }

    // Kiểm tra sắp xếp
    const sortStage = this._findSortStage(queryPlanner.winningPlan);
    if (sortStage && sortStage.sortPattern) {
      const sortFields = Object.keys(sortStage.sortPattern);
      if (
        indexesUsed === 'No index used (COLLSCAN)' ||
        !this._isSortCoveredByIndex(sortFields, indexesUsed)
      ) {
        recommendations.push(
          `Sắp xếp không được hỗ trợ bởi chỉ mục. Xem xét thêm chỉ mục bao gồm các trường sắp xếp: ${sortFields.join(', ')}`
        );
      }
    }

    return recommendations;
  }

  /**
   * Tìm stage sắp xếp trong kế hoạch truy vấn
   * @private
   * @param {Object} plan - Kế hoạch truy vấn
   * @returns {Object|null} Stage sắp xếp hoặc null nếu không tìm thấy
   */
  static _findSortStage(plan) {
    if (!plan) return null;

    if (plan.stage === 'SORT') {
      return plan;
    }

    if (plan.inputStage) {
      return this._findSortStage(plan.inputStage);
    }

    if (plan.inputStages) {
      for (const stage of plan.inputStages) {
        const sortStage = this._findSortStage(stage);
        if (sortStage) return sortStage;
      }
    }

    return null;
  }

  /**
   * Kiểm tra xem sắp xếp có được hỗ trợ bởi chỉ mục không
   * @private
   * @param {Array} sortFields - Các trường sắp xếp
   * @param {String} indexName - Tên chỉ mục
   * @returns {Boolean} Sắp xếp có được hỗ trợ không
   */
  static _isSortCoveredByIndex(sortFields, indexName) {
    // Phương thức này cần thông tin về cấu trúc chỉ mục
    // Trong thực tế, bạn cần truy vấn thông tin chỉ mục từ MongoDB
    // Đây là một triển khai đơn giản
    if (indexName === 'No index used (COLLSCAN)') {
      return false;
    }

    // Giả định rằng tên chỉ mục có dạng: collection_field1_field2_...
    const indexFields = indexName.split('_').slice(1);

    // Kiểm tra xem tất cả các trường sắp xếp có trong chỉ mục không
    return sortFields.every((field) => indexFields.includes(field));
  }

  /**
   * Đề xuất chỉ mục dựa trên truy vấn
   * @param {Object} parsedQuery - Truy vấn đã phân tích
   * @returns {String} Đề xuất chỉ mục
   */
  static suggestIndex(parsedQuery) {
    if (!parsedQuery) return null;

    const fields = [];

    // Phân tích các trường trong truy vấn
    for (const field in parsedQuery) {
      // Bỏ qua các toán tử đặc biệt
      if (field.startsWith('$')) continue;

      fields.push(field);
    }

    if (fields.length === 0) return null;

    // Tạo chuỗi đề xuất chỉ mục
    return `{ ${fields.map((f) => `"${f}": 1`).join(', ')} }`;
  }

  /**
   * Ghi log truy vấn chậm
   * @param {Object} queryInfo - Thông tin truy vấn
   * @param {String} queryType - Loại truy vấn (find, aggregate, ...)
   * @returns {Promise<void>}
   */
  static async logSlowQuery(queryInfo, queryType = 'find') {
    try {
      const logDir = path.join(process.cwd(), 'logs');

      // Tạo thư mục logs nếu chưa tồn tại
      try {
        await fs.mkdir(logDir, { recursive: true });
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }

      const logFile = path.join(logDir, 'slow-queries.log');
      const timestamp = new Date().toISOString();

      const logEntry = {
        timestamp,
        queryType,
        ...queryInfo,
      };

      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
    } catch (error) {
      console.error('Lỗi khi ghi log truy vấn chậm:', error);
    }
  }

  /**
   * Phân tích tất cả các chỉ mục trong collection
   * @param {mongoose.Model} model - Model Mongoose
   * @returns {Promise<Array>} Danh sách chỉ mục và thông tin
   */
  static async analyzeIndexes(model) {
    // Lấy thông tin về tất cả các chỉ mục
    const indexes = await model.collection.indexes();

    // Phân tích từng chỉ mục
    return Promise.all(
      indexes.map(async (index) => {
        // Lấy thống kê sử dụng chỉ mục
        const stats = await model.collection.stats();

        return {
          name: index.name,
          fields: index.key,
          unique: !!index.unique,
          sparse: !!index.sparse,
          size: stats.indexSizes?.[index.name] || 0,
          usage: await this._getIndexUsageStats(model, index.name),
        };
      })
    );
  }

  /**
   * Lấy thống kê sử dụng chỉ mục
   * @private
   * @param {mongoose.Model} model - Model Mongoose
   * @param {String} indexName - Tên chỉ mục
   * @returns {Promise<Object>} Thống kê sử dụng
   */
  static async _getIndexUsageStats(model, indexName) {
    try {
      // Sử dụng aggregation để lấy thông tin sử dụng chỉ mục
      const result = await model.db.db.command({
        aggregate: model.collection.collectionName,
        pipeline: [{ $indexStats: {} }, { $match: { name: indexName } }],
        cursor: {},
      });

      if (result?.cursor?.firstBatch?.length > 0) {
        const stats = result.cursor.firstBatch[0];
        return {
          operations: stats.accesses.ops,
          since: stats.accesses.since,
        };
      }

      return { operations: 0, since: new Date() };
    } catch (error) {
      console.error(`Lỗi khi lấy thống kê sử dụng chỉ mục ${indexName}:`, error);
      return { operations: 0, since: new Date(), error: error.message };
    }
  }

  /**
   * Tạo báo cáo hiệu suất truy vấn
   * @param {mongoose.Model} model - Model Mongoose
   * @param {Number} days - Số ngày để phân tích
   * @returns {Promise<Object>} Báo cáo hiệu suất
   */
  static async generatePerformanceReport(model, days = 7) {
    try {
      // Phân tích chỉ mục
      const indexes = await this.analyzeIndexes(model);

      // Đọc log truy vấn chậm
      const slowQueries = await this._readSlowQueriesLog(days);

      // Lọc các truy vấn liên quan đến collection này
      const collectionQueries = slowQueries.filter((q) => q.collection === model.collection.name);

      // Phân tích các mẫu truy vấn phổ biến
      const queryPatterns = this._analyzeQueryPatterns(collectionQueries);

      // Tạo báo cáo
      return {
        collection: model.collection.name,
        indexes,
        slowQueriesCount: collectionQueries.length,
        averageExecutionTime: this._calculateAverage(
          collectionQueries.map((q) => q.executionTimeMs)
        ),
        commonQueryPatterns: queryPatterns,
        indexRecommendations: this._generateIndexRecommendations(queryPatterns, indexes),
      };
    } catch (error) {
      console.error('Lỗi khi tạo báo cáo hiệu suất:', error);
      return { error: error.message };
    }
  }

  /**
   * Đọc log truy vấn chậm
   * @private
   * @param {Number} days - Số ngày để đọc
   * @returns {Promise<Array>} Danh sách truy vấn chậm
   */
  static async _readSlowQueriesLog(days) {
    try {
      const logFile = path.join(process.cwd(), 'logs', 'slow-queries.log');

      // Kiểm tra xem file log có tồn tại không
      try {
        await fs.access(logFile);
      } catch (err) {
        return []; // File không tồn tại
      }

      // Đọc file log
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.split('\n').filter((line) => line.trim());

      // Phân tích từng dòng
      const queries = lines
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch (err) {
            return null;
          }
        })
        .filter((q) => q !== null);

      // Lọc theo ngày
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return queries.filter((q) => {
        const queryDate = new Date(q.timestamp);
        return queryDate >= cutoffDate;
      });
    } catch (error) {
      console.error('Lỗi khi đọc log truy vấn chậm:', error);
      return [];
    }
  }

  /**
   * Phân tích các mẫu truy vấn phổ biến
   * @private
   * @param {Array} queries - Danh sách truy vấn
   * @returns {Array} Các mẫu truy vấn phổ biến
   */
  static _analyzeQueryPatterns(queries) {
    const patterns = {};

    // Nhóm các truy vấn theo mẫu
    queries.forEach((query) => {
      if (!query.queryShape) return;

      if (!patterns[query.queryShape]) {
        patterns[query.queryShape] = {
          pattern: query.queryShape,
          count: 0,
          totalTime: 0,
          examples: [],
        };
      }

      patterns[query.queryShape].count++;
      patterns[query.queryShape].totalTime += query.executionTimeMs;

      // Lưu tối đa 3 ví dụ
      if (patterns[query.queryShape].examples.length < 3) {
        patterns[query.queryShape].examples.push({
          timestamp: query.timestamp,
          executionTimeMs: query.executionTimeMs,
        });
      }
    });

    // Chuyển đổi thành mảng và sắp xếp theo số lượng
    return Object.values(patterns)
      .map((p) => ({
        ...p,
        averageTime: p.totalTime / p.count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Tạo đề xuất chỉ mục dựa trên mẫu truy vấn
   * @private
   * @param {Array} queryPatterns - Các mẫu truy vấn
   * @param {Array} existingIndexes - Các chỉ mục hiện có
   * @returns {Array} Đề xuất chỉ mục
   */
  static _generateIndexRecommendations(queryPatterns, existingIndexes) {
    const recommendations = [];

    queryPatterns.forEach((pattern) => {
      try {
        // Phân tích mẫu truy vấn
        const queryObj = JSON.parse(pattern.pattern);

        // Lấy các trường trong truy vấn
        const queryFields = Object.keys(queryObj).filter((key) => !key.startsWith('$'));

        if (queryFields.length === 0) return;

        // Kiểm tra xem đã có chỉ mục nào bao gồm các trường này chưa
        const hasMatchingIndex = existingIndexes.some((index) => {
          const indexFields = Object.keys(index.fields);
          return queryFields.every((field) => indexFields.includes(field));
        });

        if (!hasMatchingIndex) {
          recommendations.push({
            queryPattern: pattern.pattern,
            suggestedIndex: `{ ${queryFields.map((f) => `"${f}": 1`).join(', ')} }`,
            queryCount: pattern.count,
            averageTime: pattern.averageTime,
          });
        }
      } catch (error) {
        // Bỏ qua các mẫu không hợp lệ
      }
    });

    return recommendations;
  }

  /**
   * Tính giá trị trung bình của một mảng số
   * @private
   * @param {Array} values - Mảng các giá trị
   * @returns {Number} Giá trị trung bình
   */
  static _calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

module.exports = QueryAnalyzer;
