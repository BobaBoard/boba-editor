const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ogWebpack = require("../../webpack.config.cjs");

module.exports = {
  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins: [new MiniCssExtractPlugin()],

  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    library: "boba-editor",
    libraryTarget: "umd",
    globalObject: "globalThis",
  },
  entry: path.join(__dirname, "src/", "index.ts"),
  optimization: {
    minimize: false,
  },
  // Source maps support ('inline-source-map' also works)
  devtool: "source-map",

  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: "base64-image-loader",
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
};
