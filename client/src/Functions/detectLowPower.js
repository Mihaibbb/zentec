export default function detectPowerSavingMode() {
    // for iOS/iPadOS Safari, and maybe MacBook macOS Safari (not tested)
    if (/iP(hone|ad|od)/.test(navigator.userAgent)) {
      // In Low Power Mode, cumulative delay effect happens on setInterval()
      return new Promise((resolve) => {
        let fps = 50;
        let numFrames = 30;
        let startTime = performance.now();
        let i = 0;
        let handle = setInterval(() => {
          if (i < numFrames) {
            i++;
            return;
          }
          clearInterval(handle);
          let interval = 1000 / fps;
          let actualInterval = (performance.now() - startTime) / numFrames;
          let ratio = actualInterval / interval; // 1.3x or more in Low Power Mode, 1.1x otherwise
          console.log(actualInterval, interval, ratio);
          resolve(ratio > 1.3);
        }, 1000 / fps);
      });
    }
    // for Safari, Chromium 108 (experimental), and maybe future Firefox
    else {
      // for Chromium, experimental feature [battery saver mode](about://flags/#battery-saver-mode-available) need to be enabled firstly
      // and then [Energy Saver](chrome://settings/performance)
      return detectFrameRate().then((frameRate) => {
        // frameRate will be 30fps or 20fps in Battery Saver Mode, otherwise will be closed to monitor refresh rate (typically 60Hz)
        if (frameRate < 31) {
          return true;
        }
        // FIXME fallback to regard as Low Power Mode when battery power is low (down to 20%)
        else if (navigator.getBattery) {
          return navigator.getBattery().then((battery) => {
            return (!battery.charging && battery.level <= 0.2) ? true : false;
          });
        }
        return undefined;
      });
    }
  }
  
  export function detectFrameRate() {
    return new Promise((resolve) => {
      let numFrames = 30;
      let startTime = performance.now();
      let i = 0;
      let tick = () => {
        if (i < numFrames) {
          i++;
          requestAnimationFrame(tick);
          return;
        }
        let frameRate = numFrames / ((performance.now() - startTime) / 1000);
        resolve(frameRate);
      };
      requestAnimationFrame(() => {
        tick();
      });
    });
  }