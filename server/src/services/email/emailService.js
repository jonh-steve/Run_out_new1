/**
 * Email Service - xử lý gửi email
 * @author Steve
 * @project RunOut-Biliard
 */

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');
const logger = require('../../config/logger');
const environment = require('../../config/environment');

/**
 * Class EmailService - xử lý gửi email
 */
class EmailService {
  constructor() {
    // Thiết lập transporter
    this.setupTransporter();

    // Đường dẫn đến thư mục chứa templates
    this.templatesDir = path.resolve(__dirname, 'templates');

    // Cache cho templates đã compile
    this.templateCache = {};
  }

  /**
   * Thiết lập transporter cho Nodemailer
   */
  setupTransporter() {
    // Sử dụng cấu hình khác nhau tùy thuộc vào môi trường
    if (environment.app.environment === 'development') {
      // Sử dụng Ethereal cho môi trường development
      this.createTestAccount();
    } else {
      // Sử dụng cấu hình SMTP thực cho production
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  /**
   * Tạo test account với Ethereal cho môi trường development
   */
  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      logger.info(`Đã tạo test account với Ethereal Email: ${testAccount.user}`);
    } catch (error) {
      logger.error(`Không thể tạo test account: ${error.message}`);

      // Fallback đến cấu hình giả lập
      this.transporter = {
        sendMail: async (mailOptions) => {
          logger.info('Gửi email giả lập:');
          logger.info(`Đến: ${mailOptions.to}`);
          logger.info(`Chủ đề: ${mailOptions.subject}`);
          logger.info(`Nội dung: ${mailOptions.text || mailOptions.html}`);

          return { messageId: `mock_${Date.now()}` };
        },
      };
    }
  }

  /**
   * Đọc và compile template email
   * @param {string} templateName - Tên template
   * @returns {Promise<Function>} - Template đã compile
   */
  async getTemplate(templateName) {
    // Kiểm tra cache
    if (this.templateCache[templateName]) {
      return this.templateCache[templateName];
    }

    try {
      // Đọc file template
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      const templateSource = await fs.readFile(templatePath, 'utf8');

      // Compile template
      const template = handlebars.compile(templateSource);

      // Lưu vào cache
      this.templateCache[templateName] = template;

      return template;
    } catch (error) {
      logger.error(`Không thể đọc template email '${templateName}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Gửi email
   * @param {Object} options - Tùy chọn email
   * @param {string} options.to - Người nhận
   * @param {string} options.subject - Chủ đề
   * @param {string} options.template - Tên template (không có phần mở rộng)
   * @param {Object} options.context - Dữ liệu cho template
   * @returns {Promise<Object>} - Kết quả gửi email
   */
  async sendEmail(options) {
    try {
      const { to, subject, template, context } = options;

      // Lấy template
      const compiledTemplate = await this.getTemplate(template);

      // Thêm vào các biến toàn cục
      const enhancedContext = {
        ...context,
        appName: environment.app.name,
        signature: environment.app.signature,
        year: new Date().getFullYear(),
        logoUrl: process.env.APP_LOGO_URL || 'https://example.com/logo.png',
      };

      // Render HTML từ template
      const html = compiledTemplate(enhancedContext);

      // Thiết lập mail options
      const mailOptions = {
        from: process.env.EMAIL_FROM || `"${environment.app.name}" <no-reply@example.com>`,
        to,
        subject,
        html,
      };

      // Gửi email
      const info = await this.transporter.sendMail(mailOptions);

      // Log URL để xem email (chỉ trong môi trường development với Ethereal)
      if (environment.app.environment === 'development' && info.messageId) {
        logger.info(`URL xem email: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return info;
    } catch (error) {
      logger.error(`Lỗi gửi email: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();

// Helper function để sử dụng service dễ dàng hơn
module.exports.sendEmail = (options) => module.exports.sendEmail(options);
