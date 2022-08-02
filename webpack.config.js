const path = require("path");
const { ESBuildMinifyPlugin } = require("esbuild-loader");
const { VueLoaderPlugin } = require("vue-loader");
const {
  container: { ModuleFederationPlugin },
} = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { name, port } = require("./configuration.json");

const isProd = process.env.NODE_ENV === "production";
console.log(isProd ? "production" : "development");
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
    port: process.env.PORT || port,
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
  resolve: {
    alias: {
      vue$: isProd ? "vue/dist/vue.min.js" : "vue/dist/vue.js",
    },
  },
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
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              "style-loader",
              {
                loader: "css-loader",
                options: {
                  modules: {
                    localIdentName: "[local]_[hash:base64:5]",
                  },
                },
              },
              {
                loader: "sass-loader",
                options: {
                  additionalData: `$mds-font-asset-path: '~@mds/fonts/src/';`,
                },
              },
              {
                loader: "esbuild-loader",
                options: {
                  loader: "css",
                  minify: true,
                },
              },
            ],
          },
          {
            use: [
              "style-loader",
              "css-loader",
              {
                loader: "sass-loader",
                options: {
                  additionalData: `$mds-font-asset-path: '~@mds/fonts/src/';`,
                },
              },
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
      exposes: {
        "./Example": "./src/components/Example.vue",
      },
      remotes: {
        my_remote: `promise new Promise((resolve, reject) => {
          __module_federation__.loadRemote('my_remote')
            .then(resolve).catch(reject);
        });`,
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
