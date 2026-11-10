const { defineConfig } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const home = require("node:os").homedir();
const candidates = [
  process.env.VOP_CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ...["1254", "1252", "1243", "1234"].map((v) =>
    path.join(
      home,
      `Library/Caches/ms-playwright/chromium-${v}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
    ),
  ),
];
const executablePath = candidates.find((p) => p && fs.existsSync(p));
module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.cjs",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 45000,
  use: {
    headless: true,
    viewport: { width: 1440, height: 900 },
    launchOptions: executablePath ? { executablePath } : {},
  },
  outputDir: "/tmp/vop-test-results",
});
