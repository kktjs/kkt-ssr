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
    importLoaders: 1,
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
      test: /\.scss$/,
      exclude: [options.appBuildDist, /\.module\.scss$/],
      sideEffects: true,
      use: (() => {
        const rulers = [];
        // Style-loader does not work in Node.js without some crazy
        // magic. Luckily we just need css-loader.
        if (IS_NODE) {
          rulers.push({
            loader: require.resolve('css-loader'),
            options: {
              ...cssModuleOption,
              exportOnlyLocals: true,
            },
          });
        } else {
          // Generating inline styles makes it harder to locate problems.
          // rulers.push(MiniCssExtractPlugin.loader);
          if (IS_DEV) {
            rulers.push(require.resolve('style-loader'));
          } else {
            rulers.push(MiniCssExtractPlugin.loader);
          }
          rulers.push({
            loader: require.resolve('css-loader'),
            options: {
              ...cssModuleOption,
            },
          });
          rulers.push(postcssLoader);
        }
        rulers.push(require.resolve('sass-loader'));
        return rulers;
      })(),
    },
    // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
    // using the extension .module.css
    {
      test: /\.module\.scss$/,
      exclude: [options.appBuildDist],
      sideEffects: true,
      use: (() => {
        const rulers = [];
        if (IS_NODE) {
          // rulers.push({
          //   // on the server we do not need to embed the css and just want the identifier mappings
          //   // https://github.com/webpack-contrib/css-loader#scope
          //   loader: require.resolve('css-loader/locals'),
          //   options: cssModuleOption,
          // });
          rulers.push({
            loader: require.resolve('css-loader'),
            options: {
              ...cssModuleOption,
              // css-loader@2 dropped css-loader/locals loader and replaced it with exportOnlyLocals option.
              exportOnlyLocals: true,
              modules: true,
            },
          });
        } else {
          // Generating inline styles makes it harder to locate problems.
          // rulers.push(MiniCssExtractPlugin.loader);
          if (IS_DEV) {
            rulers.push(require.resolve('style-loader'));
          } else {
            rulers.push(MiniCssExtractPlugin.loader);
          }
          rulers.push({
            loader: require.resolve('css-loader'),
            options: {
              ...cssModuleOption,
              modules: true,
            },
          });
          rulers.push(postcssLoader);
        }
        rulers.push(require.resolve('sass-loader'));
        return rulers;
      })(),
    },
  ];
  return conf;
};
