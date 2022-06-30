"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages('bbsfdx', 'devconsoledelete');
class Delete extends command_1.SfdxCommand {
    async run() {
        const conn = this.org.getConnection();
        const users = await conn.query('select Id from User where Username=\'' + conn.getUsername() + '\'');
        const userId = users.records[0].Id;
        this.ux.log(messages.getMessage('userIdLogMessage') + ' ' + userId);
        const workspaces = await conn.tooling.query('select id from IDEWorkspace where CreatedById=\'' + userId + '\'');
        const workspaceIds = workspaces.records.map(workspace => {
            return workspace.Id;
        });
        const deleteResults = await conn.tooling.sobject('IDEWorkspace').delete(workspaceIds);
        let success = true;
        let deletedCount = 0;
        deleteResults.forEach(deleteResult => {
            success = success && deleteResult.success;
            deletedCount++;
        });
        if (success) {
            this.ux.log(messages.getMessage('successMessage').replace('{0}', deletedCount.toString()));
        }
        else {
            this.ux.log(messages.getMessage('errorMessage').replace('{0}', deletedCount.toString())
                .replace('{1}', workspaceIds.length.toString()));
        }
        return { success, deletedCount, totalRecords: workspaceIds.length };
    }
}
exports.default = Delete;
Delete.description = messages.getMessage('commandDescription');
Delete.examples = [
    `$ sfdx bb:devconsole:delete --targetusername myOrg@example.com
  
  Deleting workspace records for user id XXXXXXXXXXXXXXXXX
  Successfully deleted 1 workspace records
`
];
Delete.args = [{ name: 'file' }];
Delete.flagsConfig = {};
// Comment this out if your command does not require an org username
Delete.requiresUsername = true;
// Comment this out if your command does not support a hub org username
// protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Delete.requiresProject = false;
//# sourceMappingURL=delete.js.map