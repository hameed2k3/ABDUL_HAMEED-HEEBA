import { Config } from "@remotion/cli/config";
import { browserOptions } from "./browser";

const browser = browserOptions();
if (browser.browserExecutable) Config.setBrowserExecutable(browser.browserExecutable);
if (browser.chromeMode) Config.setChromeMode(browser.chromeMode);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(20);
