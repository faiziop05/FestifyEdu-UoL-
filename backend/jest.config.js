module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/middlewares/**/*.js',
    'src/controllers/global/auth.js',
    'src/controllers/superAdmin/manageOrganizations.js',
    'src/controllers/admin/manageUsers.js',
    'src/controllers/admin/dataAccess.js',
    'src/controllers/teachers/datasetController.js',
    'src/controllers/teachers/room.js',
    'src/controllers/teachers/quizzesController.js',
    'src/controllers/teacher/performance.js',
    'src/controllers/Student/room.js',
    'src/controllers/Student/Quizzes.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/integration/setup.js'],
};
