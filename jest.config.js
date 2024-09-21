/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testMatch: ['**/__tests__/*.test.ts'],
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};
