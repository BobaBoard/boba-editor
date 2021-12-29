const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins: [new MiniCssExtractPlugin()],
  target: "node",
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
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react",
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react-dom",
      amd: "react-dom",
    },
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
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            // TODO: figure out stable naming for SSR
            // options: {
            //   importLoaders: 1,
            //   modules: {
            //     localIdentName: "[name]__[local]___[hash:base64:5]",
            //   },
            // },
          },
        ],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
};
