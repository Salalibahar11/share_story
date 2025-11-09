//
const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 9000,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },

    // ✅ FIX: Konfigurasi proxy diubah menjadi ARRAY untuk v5
    proxy: [
      {
        context: ['/v1'], // Path yang akan di-proxy
        target: 'https://story-api.dicoding.dev',
        changeOrigin: true,
        secure: false,
      },
    ],
  },
});