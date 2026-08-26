module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@navigation/(.*)$": "<rootDir>/src/navigation/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@context/(.*)$": "<rootDir>/src/context/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*)",
  ],
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: ["/node_modules/"],
};
