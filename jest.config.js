export default {
    transform: {
      "^.+\\.m?js$": ["babel-jest", { configFile: "./babel.config.json" }]
    },
    testEnvironment: "node",
    moduleFileExtensions: ["js", "mjs"],
    testMatch: ["**/tests/*.test.mjs"]
  };