const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (conf, options) => {
  const IS_NODE = options.target === 'node';
  const IS_DEV = options.env === 'dev';
  const postcssLoader = {
    // Options for PostCSS as we reference these options twice
    // Adds vendor prefixing based on your specified browser support in
    // package.json
    loader: require.resolve('postcss-loader'),
    options: {
      // Necessary for external CSS imports to work
      // https://github.com/facebook/create-react-app/issues/2677
      ident: 'postcss',
      plugins: () => [
        require('postcss-flexbugs-fixes'), // eslint-disable-line
        require('postcss-preset-env')({ // eslint-disable-line
          autoprefixer: {
            flexbox: 'no-2009',
          },
          stage: 3,
        }),
      ],
    },
  };
  const cssModuleOption = {
    modules: true,
    importLoaders: 1,
    minimize: true,
    localIdentName: '[hash:8]',
  };
  if (IS_DEV) {
    cssModuleOption.localIdentName = '[path]__[name]___[local]';
  }
  // "postcss" loader applies autoprefixer to our CSS.
  // "css" loader resolves paths in CSS and adds assets as dependencies.
  // "style" loader turns CSS into JS modules that inject <style> tags.
  // In production, we use a plugin to extract that CSS to a file, but
  // in development "style" loader enables hot editing of CSS.
  //
  // Note: this yields the exact same CSS config as create-react-app.
  conf.module.rules = [
    ...conf.module.rules,
    {
      test: /\.css$/,
      exclude: [options.appBuildDist, /\.module\.css$/],
      sideEffects: true,
      use: (() => {
        const rulers = [];
        // Style-loader does not work in Node.js without some crazy
        // magic. Luckily we just need css-loader.
        if (IS_NODE) {
          rulers.push({
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
            },
          });
        } else {
          if (IS_DEV) {
            rulers.push(require.resolve('style-loader'));
          } else {
            rulers.push(MiniCssExtractPlugin.loader);
          }
          rulers.push({
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
            },
          });
          // rulers.push(postcssLoader);
        }
        return rulers;
      })(),
    },
    // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
    // using the extension .module.css
    {
      test: /\.module\.css$/,
      exclude: [options.appBuildDist],
      sideEffects: true,
      use: (() => {
        const rulers = [];
        if (IS_NODE) {
          rulers.push({
            // on the server we do not need to embed the css and just want the identifier mappings
            // https://github.com/webpack-contrib/css-loader#scope
            loader: require.resolve('css-loader/locals'),
            options: cssModuleOption,
          });
        } else {
          if (IS_DEV) {
            rulers.push(require.resolve('style-loader'));
          } else {
            rulers.push(MiniCssExtractPlugin.loader);
          }
          rulers.push({
            loader: require.resolve('css-loader'),
            options: cssModuleOption,
          });
          rulers.push(postcssLoader);
        }
        return rulers;
      })(),
    },
  ];
  return conf;
};
