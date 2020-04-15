"use strict";
const fs = require("fs");
const ejs = require("ejs");
const data = require("./vars");
const tpl = fs.readFileSync(__dirname + "/template.ejs").toString();

const base = '/examples/';
if (typeof base !== "string") {
  throw new Error("env CONTENT_BASE is required to be set.");
}
const banner =
  "Do not edit this file! It is generated by `generate.js` in this folder, from `template.ejs` and " +
  "vars.js.";

data.forEach(function(datum, i) {
  datum.base = base.replace(/\/$/, ""); // trim trailing slash
  datum.index = i;
  datum.banner = banner;
  datum.previous = data[i - 1];
  datum.next = data[i + 1];
  const html = ejs.render(tpl, datum);
  fs.writeFileSync(__dirname + "/" + i + "-" + datum.source + ".html", html);
});
