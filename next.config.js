const { parsed: localEnv } = require("dotenv").config();
const webpack = require("webpack");
// const withLess = require("@zeit/next-less");
const withCSS = require("@zeit/next-css");

const withAssetRelocator = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      const { isServer } = options;

      if (isServer) {
        config.node = Object.assign({}, config.node, {
          __dirname: false,
          __filename: false
        });

        config.module.rules.unshift({
          test: /\.(m?js|node)$/,
          parser: { amd: false },
          use: {
            loader: "@zeit/webpack-asset-relocator-loader",
            options: {
              outputAssetBase: "assets",
              existingAssetNames: [],
              wrapperCompatibility: true,
              production: true,
              lessLoaderOptions: {
                javascriptEnabled: true
              }
            }
          }
        });
      }

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  });
};

const config = {
  env: {
    REACT_APP_API_KEY: process.env.REACT_APP_API_KEY,
    REACT_APP_AUTH_DOMAIN: process.env.REACT_APP_AUTH_DOMAIN,
    REACT_APP_DATABASE_URL: process.env.REACT_APP_DATABASE_URL,
    REACT_APP_PROJECT_ID: process.env.REACT_APP_PROJECT_ID,
    REACT_APP_STORAGE_BUCKET: process.env.REACT_APP_STORAGE_BUCKET,
    REACT_APP_MESSAGING_SENDER_ID: process.env.REACT_APP_MESSAGING_SENDER_ID,
    REACT_APP_APP_ID: process.env.REACT_APP_APP_ID
  }
};

module.exports = withCSS({
  ...withAssetRelocator(config)
  // ,
  // lessLoaderOptions: {
  //   javascriptEnabled: true,
  //   modifyVars: {
  //     "@primary-color": "#01B96B"
  //   }
  // }
});

// module.exports = withCSS({
//   webpack(config) {
//     config.plugins.push(new webpack.EnvironmentPlugin(localEnv));

//     return config;
//   },
//   env: {
//     REACT_APP_API_KEY: process.env.REACT_APP_API_KEY,
//     REACT_APP_AUTH_DOMAIN: process.env.REACT_APP_AUTH_DOMAIN,
//     REACT_APP_DATABASE_URL: process.env.REACT_APP_DATABASE_URL,
//     REACT_APP_PROJECT_ID: process.env.REACT_APP_PROJECT_ID,
//     REACT_APP_STORAGE_BUCKET: process.env.REACT_APP_STORAGE_BUCKET,
//     REACT_APP_MESSAGING_SENDER_ID: process.env.REACT_APP_MESSAGING_SENDER_ID,
//     REACT_APP_APP_ID: process.env.REACT_APP_APP_ID
//   }
// });
