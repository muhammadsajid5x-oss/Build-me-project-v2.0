/* eslint-disable no-undef, @typescript-eslint/no-require-imports */

const path = require("node:path");
const fs = require("node:fs");

const customResolver = (request, options) => {
  if (request.endsWith(".js")) {
    const tsRequest = request.slice(0, -3) + ".ts";
    const tsPath = path.resolve(options.basedir, tsRequest);

    if (fs.existsSync(tsPath)) {
      return tsPath;
    }
  }

  return options.defaultResolver(request, options);
};

module.exports = customResolver;
