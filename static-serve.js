const path = require("path");
const StaticServer = require("static-server");
const { port: configuredPort } = require("./configuration.json");

const port = process.env.PORT || configuredPort;

const server = new StaticServer({
  port,
  rootPath: path.resolve(__dirname, "dist"),
});

server.start(() => {
  console.log(`Serving assets from dist folder at port ${port}...`);
});
