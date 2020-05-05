module.exports = {
  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  target: "node",

  output: {
    library: ["BobaEditor"],
    //libraryExport: ["index"],
    libraryTarget: "umd",
  },
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
    ],
  },
};
