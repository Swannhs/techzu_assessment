module.exports = {
  roots: ["<rootDir>/test"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.json"
      }
    ]
  },
  extensionsToTreatAsEsm: [".ts"]
};
