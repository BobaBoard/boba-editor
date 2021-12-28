const webpackConfig = require("../webpack.config.cjs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-controls",
    "@storybook/addon-viewport/register",
    "@storybook/addon-actions",
    "@storybook/addon-a11y",
    "storybook-css-modules-preset",
  ],
  webpackFinal: async (config) => {
    config.devtool = "inline-source-map";
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve("babel-loader"),
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      ],
    });

    config.module.rules.push({
      test: /\.html$/,
      use: ["html-loader"],
    });

    config.resolve.extensions.push(".ts", ".tsx");
    return config;
  },
  features: {
    postcss: false,
  },
};
