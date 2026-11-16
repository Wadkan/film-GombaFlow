const launchOptions = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
  : {};

module.exports = {
  testDir: './tests',
  testMatch: '**/viewer.spec.cjs',
  outputDir: '/tmp/gombaflow-playwright',
  use: { viewport: { width: 390, height: 844 }, launchOptions },
};
