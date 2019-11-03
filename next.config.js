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
    FB_API_KEY: process.env.FB_API_KEY,
    FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN,
    FB_DATABASE_URL: process.env.FB_DATABASE_URL,
    FB_PROJECT_ID: process.env.FB_PROJECT_ID,
    FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET,
    FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID,
    FB_APP_ID: process.env.FB_APP_ID
  }
};

module.exports = withCSS({
  ...withAssetRelocator({
    webpack(config) {
      config.plugins.push(new webpack.EnvironmentPlugin(localEnv));

      return config;
    },
    env: {
      FB_API_KEY: process.env.FB_API_KEY || "",
      FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN || "",
      FB_DATABASE_URL: process.env.FB_DATABASE_URL || "",
      FB_PROJECT_ID: process.env.FB_PROJECT_ID || "",
      FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET || "",
      FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID || "",
      FB_APP_ID: process.env.FB_APP_ID || "",
      PROD_API_KEY: process.env.PROD_API_KEY || "",
      PROD_AUTH_DOMAIN: process.env.PROD_AUTH_DOMAIN || "",
      PROD_DATABASE_URL: process.env.PROD_DATABASE_URL || "",
      PROD_PROJECT_ID: process.env.PROD_PROJECT_ID || "",
      PROD_MESSAGING_SENDER_ID: process.env.PROD_MESSAGING_SENDER_ID || "",
      PROD_APP_ID: process.env.PROD_APP_ID || ""
    }
  })
  // ,
  // lessLoaderOptions: {
  //   javascriptEnabled: true,
  //   modifyVars: {
  //     "@primary-color": "#01B96B"
  //   }
  // }
});

// module.exports = withCSS({

// });
