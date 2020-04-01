module.exports = {
    "testResultsProcessor": "jest-sonar-reporter",
    "coverageThreshold": {
        "global": {
            "statements": 80,
            "branches": 80,
            "functions": 80,
            "lines": 80
        }
    },
    "globals": {
        "ts-jest": {
            "babelConfig": false,
            "diagnostics": false
        }
    },
    "preset": "ts-jest",
    "testMatch": null,
    "testEnvironment": "node",
    "clearMocks": true,
    "collectCoverageFrom": [
        "src/*/**/*.{ts,js}",
        "!src/**/{routes,index}.{ts,js}",
        "!src/presentation-layer/documentation/**/*",
        "!src/service-layer/utils/ErrorHandling.ts"
    ],
    "modulePathIgnorePatterns": [
        "<rootDir>/dist/",
        "<rootDir>/node_modules/"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "globalSetup": "./jest.setup.js",
    "globalTeardown": "./jest.teardown.js",
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
        "ts",
        "js",
        "json",
        "node"
    ]
}