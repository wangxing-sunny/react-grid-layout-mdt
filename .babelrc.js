'use strict';

module.exports = {
  "presets": [
    [
      "@babel/preset-env",
      {
        targets: "> 0.25%, not dead",
      }
    ],
    "@babel/react"
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties",
  ],
  "env": {
    "test": {
      "plugins": [
        "espower"
      ]
    }
  }
}
