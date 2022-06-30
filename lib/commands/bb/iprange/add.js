"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const fast_xml_parser_1 = require("fast-xml-parser");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const xml2js_1 = require("xml2js");
const files_1 = require("../../../shared/files");
const metadata_1 = require("../../../shared/metadata");
const compressing = require("compressing");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages('bbsfdx', 'iprange');
class Add extends command_1.SfdxCommand {
    async run() {
        //this.ux.log('Range = ' + JSON.stringify(this.flags.range, null, 4));
        const conn = this.org.getConnection();
        const retrieveMDTypes = [{
                members: 'Security',
                name: 'Settings'
            }];
        const retrieveResult = await metadata_1.retrieveMetadata(conn, retrieveMDTypes, this.ux, messages);
        const tmpDir = files_1.getTmpDir();
        const buff = Buffer.from(retrieveResult.zipFile, 'base64');
        await compressing.zip.uncompress(buff, tmpDir);
        const settings = fs_1.readFileSync(path_1.join(tmpDir, 'settings', 'Security.settings'), 'utf-8');
        const md = fast_xml_parser_1.parse(settings);
        let networkAccess = md.SecuritySettings.networkAccess;
        if (networkAccess === '') {
            networkAccess = { ipRanges: [] };
            md.SecuritySettings.networkAccess = networkAccess;
        }
        if (!Array.isArray(networkAccess.ipRanges)) {
            networkAccess.ipRanges = [networkAccess.ipRanges];
        }
        const { ignoreerrors } = this.flags;
        for (const range of this.flags.range) {
            const start = range[0];
            let end;
            if (2 === range.length) {
                end = range[1];
            }
            else {
                end = range[0];
            }
            networkAccess.ipRanges.push({ start, end });
        }
        const targetDir = path_1.join(tmpDir, 'target');
        fs_1.mkdirSync(targetDir);
        const settingsDir = path_1.join(targetDir, 'settings');
        fs_1.mkdirSync(settingsDir);
        const packageFile = path_1.join(targetDir, 'package.xml');
        const packageContents = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
            ' <types>\n' +
            '   <name>Settings</name>\n' +
            '   <members>Security</members>\n' +
            '  </types>\n' +
            '  <version>53.0</version>\n' +
            '</Package>';
        fs_1.writeFileSync(packageFile, packageContents);
        const security = path_1.join(settingsDir, 'Security.settings');
        const builder = new xml2js_1.Builder({ renderOpts: { pretty: true,
                indent: '    ',
                newline: '\n' },
            stringify: {
                attValue(str) {
                    return str.replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&apos;');
                }
            },
            xmldec: {
                version: '1.0', encoding: 'UTF-8'
            }
        });
        const xml = builder.buildObject(md);
        fs_1.writeFileSync(security, xml);
        const zipFile = path_1.join(tmpDir, 'uploadpkg.zip');
        await compressing.zip.compressDir(targetDir, zipFile);
        const deployOptions = {
            rollbackOnError: !ignoreerrors
        };
        const deployResult = await metadata_1.deployMetadata(conn, zipFile, this.ux, messages, deployOptions);
        this.ux.log(messages.getMessage('result').replace('{0}', deployResult.status));
        await fs_extra_1.removeSync(tmpDir);
        return { success: deployResult.success };
    }
}
exports.default = Add;
Add.description = messages.getMessage('addCommandDescription');
Add.examples = [
    `$ sfdx bb:iprange:add --targetusername myOrg@example.com --range 192.168.1.1:192.168.1.255,192.168.1.4
   Not done yet - sleeping
   Add IP range succeeded
  `
];
Add.args = [{ name: 'file' }];
Add.flagsConfig = {
    range: command_1.flags.array({
        char: 'r',
        description: messages.getMessage('rangeFlagDescription'),
        delimiter: ',',
        map: (val) => val.split(':')
    }),
    ignoreerrors: command_1.flags.boolean({
        char: 'o',
        description: messages.getMessage('ignoreErrorsFlagDescription'),
        default: false
    })
};
// Comment this out if your command does not require an org username
Add.requiresUsername = true;
// Comment this out if your command does not support a hub org username
// protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Add.requiresProject = false;
//# sourceMappingURL=add.js.map