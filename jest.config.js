module.exports = {
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  // setupFiles: ['./test/jest.setup.js'],
  setupFilesAfterEnv: [
    // '@testing-library/react/cleanup-after-each',
    '@testing-library/jest-dom/extend-expect'
  ],
  testRegex: '((\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
