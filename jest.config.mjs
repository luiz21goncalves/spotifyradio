const defaultConfig = {
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: [
    'text',
    'lcov',
  ],
  coverageThreshold: {
    global: {
      branch: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    }
  },
  watchPathIgnorePatterns: [
    "node_modules"
  ],
  transformIgnorePatterns: [
    "node_modules"
  ]
}

export default {
  projects: [
    {
      ...defaultConfig,
      testEnvironment: 'node',
      displayName: 'backend',
      collectCoverageFrom: [
        'server',
        '!server/index.js',
      ],
      transformIgnorePatterns: [
        ...defaultConfig.transformIgnorePatterns,
        "public"
      ],
      testMatch: [
        '**/__tests__/**/server/**/*.spec.js'
      ]
    },
    {
      ...defaultConfig,
      testEnvironment: 'jsdom',
      displayName: 'fontend',
      collectCoverageFrom: [
        'public',
      ],
      transformIgnorePatterns: [
        ...defaultConfig.transformIgnorePatterns,
        "public"
      ],
      testMatch: [
        '**/__tests__/**/public/**/*.spec.js'
      ]
    }
  ]
}