const path = require("path");
const { ESBuildMinifyPlugin } = require("esbuild-loader");
const { VueLoaderPlugin } = require("vue-loader");
const {
  container: { ModuleFederationPlugin },
} = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { name, port } = require("./configuration.json");

const manifest = require("./package.json");
const sharedDependencies = Object.keys(manifest.dependencies).map((d) => ({
  [d]: d,
}));

const isProd = process.env.NODE_ENV === "production";
const whenNotProd = (x) => (isProd ? undefined : x);

/** @type {import('webpack').WebpackOptionsNormalized} */
module.exports = {
  mode: isProd ? "production" : "development",

  entry: {
    main: "./src/main.js",
  },

  output: {
    library: {
      type: "umd",
    },
    path: path.resolve(__dirname, `./dist/`),
    publicPath: "auto",
  },

  devServer: whenNotProd({
    compress: true,
    port,
    host: "0.0.0.0",
    allowedHosts: "all",
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  }),

  module: {
    rules: [
      // Use esbuild as a Babel alternative
      {
        test: /\.js$/,
        loader: "esbuild-loader",
        options: {
          target: "es2015",
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.s?css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                auto: true,
                localIdentName: "[local]_[hash:base64:5]",
              },
            },
          },
          "sass-loader",
          {
            loader: "esbuild-loader",
            options: {
              loader: "css",
              minify: true,
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      // Use esbuild to minify
      new ESBuildMinifyPlugin({
        target: "es2015",
        css: true,
      }),
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      name,
      filename: "remoteEntry.js",
      library: {
        type: "var",
        name,
      },
      // shared: sharedDependencies,
      exposes: {
        "./Example": "./src/components/Example.vue",
        "./render": "./src/utilities/render",
      },
    }),
    new HtmlWebpackPlugin({
      title: "Demo",
      template: "public/index.html",
      templateParameters: {
        moduleScope: name,
      },
      inject: false,
    }),
  ],
};
