/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

import fs from "node:fs";

// The cloud sandbox this was built in had no GPU and a blocked Chrome download: there it uses the
// pre-installed headless shell with software WebGL2. On a normal machine Remotion downloads its own
// Chrome and uses the GPU (angle).
const SANDBOX_CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (fs.existsSync(SANDBOX_CHROME)) {
  Config.setBrowserExecutable(SANDBOX_CHROME);
  Config.setChromiumOpenGlRenderer("swangle");
  Config.setConcurrency(2);
} else {
  Config.setChromiumOpenGlRenderer("angle");
}
Config.setJpegQuality(94);
Config.setCodec("h264");
Config.setCrf(16);
