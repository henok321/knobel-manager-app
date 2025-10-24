module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    ['@babel/preset-typescript'],
  ],
  plugins: [
    [
      'babel-plugin-transform-vite-meta-env',
      {
        env: {
          PROD: false,
          VITE_API_URL: 'http://localhost/api',
        },
      },
    ],
  ],
};
