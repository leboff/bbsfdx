"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const files_1 = require("../../../shared/files");
const compressing = require("compressing");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages('bbsfdx', 'test');
class Parallel extends command_1.SfdxCommand {
    async run() {
        let attr = 'false';
        if (this.flags.disable) {
            attr = 'true';
        }
        const conn = this.org.getConnection();
        const apiVersion = await conn.retrieveMaxApiVersion();
        let tmpDir = files_1.getTmpDir();
        let targetDir = path_1.join(tmpDir, 'target');
        fs_1.mkdirSync(targetDir);
        let settingsDir = path_1.join(targetDir, 'settings');
        fs_1.mkdirSync(settingsDir);
        let packageFile = path_1.join(targetDir, 'package.xml');
        let packageContents = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
            ' <types>\n' +
            '   <name>Settings</name>\n';
        let fltVersion = parseFloat(apiVersion);
        if (fltVersion > 46) {
            packageContents += '    <members>Apex</members>\n' +
                '  </types>\n' +
                '  <version>47.0</version>\n' +
                '</Package>';
            let apex = path_1.join(settingsDir, 'Apex.settings');
            fs_1.writeFileSync(apex, '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<ApexSettings xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
                '  <enableDisableParallelApexTesting>' + attr + '</enableDisableParallelApexTesting>\n' +
                '</ApexSettings>\n');
        }
        else {
            packageContents += '    <members>OrgPreference</members>\n' +
                '  </types>\n' +
                '  <version>46.0</version>\n' +
                '</Package>';
            let orgPref = path_1.join(settingsDir, 'OrgPreference.settings');
            fs_1.writeFileSync(orgPref, '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<OrgPreferenceSettings xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
                '  <preferences>\n' +
                '     <settingName>DisableParallelApexTesting</settingName>\n' +
                '     <settingValue>' + attr + '</settingValue>\n' +
                '  </preferences>\n' +
                '</OrgPreferenceSettings>\n');
        }
        fs_1.writeFileSync(packageFile, packageContents);
        const zipFile = path_1.join(tmpDir, 'pkg.zip');
        await compressing.zip.compressDir(targetDir, zipFile);
        let zipStream = fs_1.createReadStream(zipFile);
        let result = await conn.metadata.deploy(zipStream, {});
        let done = false;
        let deployResult;
        while (!done) {
            deployResult = await conn.metadata.checkDeployStatus(result.id);
            done = deployResult.done;
            if (!done) {
                this.ux.log(deployResult.status + messages.getMessage('sleeping'));
                await new Promise(sleep => setTimeout(sleep, 5000));
            }
        }
        let message = (this.flags.disable ? 'Disable' : 'Enable') + messages.getMessage('deploySucceded');
        if (!deployResult.success) {
            message = messages.getMessage('deployFailed') + ' ' + messages.getMessage('filesLocation') + tmpDir;
        }
        else if (this.flags.keep) {
            this.ux.log(messages.getMessage('filesLocation') + tmpDir);
        }
        else {
            await fs_extra_1.removeSync(tmpDir);
        }
        this.ux.log(message);
        return { success: deployResult.success, message };
    }
}
exports.default = Parallel;
Parallel.description = messages.getMessage('commandDescription');
Parallel.examples = [
    `$ sfdx bb:test:parallel -d --targetusername myOrg@example.com
   Not done yet - sleeping
   Disable parallel test execution succeeded
  `,
    `$ sfdx bb:test:parallel -e --targetusername myOrg@example.com --json
  {
    "status": 0,
    "result": {
      "success": true,
      "message": "Disable parallel test execution succeeded"
    }
  }
  `
];
Parallel.args = [{ name: 'file' }];
Parallel.flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    disable: command_1.flags.boolean({ char: 'd', description: messages.getMessage('disableFlagDescription') }),
    enable: command_1.flags.boolean({ char: 'e', description: messages.getMessage('enableFlagDescription') }),
    keep: command_1.flags.boolean({ char: 'k', description: messages.getMessage('keepFlagDescription') })
};
// Comment this out if your command does not require an org username
Parallel.requiresUsername = true;
// Comment this out if your command does not support a hub org username
//protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Parallel.requiresProject = false;
//# sourceMappingURL=parallel.js.map