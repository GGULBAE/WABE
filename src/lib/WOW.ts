import * as path from "path";

const regedit = require('regedit');

class WOW {
  static INSTALL_PATH_RETAIL_REGISTER_KEY: string = 'HKLM\\SOFTWARE\\WOW6432Node\\Blizzard Entertainment\\World of Warcraft';

  static async getInstallPath_Retail() {
    const registryKey = WOW.INSTALL_PATH_RETAIL_REGISTER_KEY;
    const result = await regedit.promisified.list(registryKey);

    const installPath = result[registryKey]?.values?.['InstallPath']?.value;

    return installPath
  }

  static async getTargetPath(installPath: string = "") {
    if (!installPath) {
      installPath = await WOW.getInstallPath_Retail();
    }

    return {
      root: installPath,
      fonts: path.join(installPath, 'Fonts'),
      WTF: path.join(installPath, 'WTF'),
      interface: path.join(installPath, 'interface')
    }
  }
}

export default WOW;