// File: webpack.config.js - Đặt ở thư mục gốc của dự án (cùng cấp với package.json)
// Cấu hình Webpack đầy đủ cho dự án React/JavaScript

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Xác định môi trường
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  // Chế độ: development hoặc production
  mode: isDevelopment ? 'development' : 'production',

  // Điểm vào của ứng dụng
  entry: './src/index.js', // Điều chỉnh đường dẫn tới file entry point của bạn

  // Cấu hình đầu ra
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
    publicPath: '/',
    clean: true, // Xóa thư mục dist trước mỗi lần build
  },

  // Source maps cho development
  devtool: isDevelopment ? 'eval-source-map' : false,

  // Cấu hình dev server
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    hot: true,
    historyApiFallback: true, // Hỗ trợ cho React Router
    open: true,
  },

  // Cấu hình module rules
  module: {
    rules: [
      // JavaScript/React
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      // CSS/SCSS
      {
        test: /\.(css|scss)$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      // Images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },

  // Cấu hình resolve
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'), // Cho phép import từ '@/components/...'
    },
  },

  // Tối ưu hóa bundle size
  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: !isDevelopment,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 10,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },

  // Plugins
  plugins: [
    // Tạo file HTML
    new HtmlWebpackPlugin({
      template: './public/index.html', // Điều chỉnh đường dẫn tới template HTML của bạn
      favicon: './public/favicon.ico', // Nếu có favicon
    }),

    // Extract CSS thành file riêng trong production
    !isDevelopment &&
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),

    // Nén file JS và CSS
    !isDevelopment &&
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),

    // Phân tích bundle size (chỉ chạy khi cần phân tích)
    process.env.ANALYZE === 'true' && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
};
