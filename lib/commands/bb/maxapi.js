"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages('bbsfdx', 'maxapi');
class Parallel extends command_1.SfdxCommand {
    async run() {
        const conn = this.org.getConnection();
        const maxApiVersion = await conn.retrieveMaxApiVersion();
        this.ux.log(messages.getMessage('maxApiVersion') + maxApiVersion);
        return { success: true, maxApiVersion: maxApiVersion };
    }
}
exports.default = Parallel;
Parallel.description = messages.getMessage('commandDescription');
Parallel.examples = [
    `$ sfdx bb:maxapi --targetusername myOrg@example.com
Max API version for org: 48.0  
`,
    `$ sfdx bb:maxapi --targetusername myOrg@example.com --json
  {
    "status": 0,
    "result": {
      "success": true,
      "maxApiVersion": "48.0"
    }
  }
  `
];
Parallel.args = [{ name: 'file' }];
Parallel.flagsConfig = {};
// Comment this out if your command does not require an org username
Parallel.requiresUsername = true;
// Comment this out if your command does not support a hub org username
//protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Parallel.requiresProject = false;
//# sourceMappingURL=maxapi.js.map