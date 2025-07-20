module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/nova-blocks/backend/__tests__', '<rootDir>/nova-blocks/frontend/src/__tests__'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
