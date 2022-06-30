"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages('bbsfdx', 'logsdelete');
class Delete extends command_1.SfdxCommand {
    async run() {
        const conn = this.org.getConnection();
        let query = 'select Id from ApexLog';
        if (!this.flags.all) {
            const users = await conn.query('select Id from User where Username=\'' + conn.getUsername() + '\'');
            const userId = users.records[0].Id;
            this.ux.log(messages.getMessage('userIdLogMessage') + ' ' + userId);
            query += ' where LogUserId= \'' + userId + '\'';
        }
        else {
            this.ux.log(messages.getMessage('allLogMessage'));
        }
        const logs = await conn.tooling.query(query);
        const logIds = logs.records.map(log => {
            return log.Id;
        });
        const deleteResults = await conn.tooling.sobject('ApexLog').delete(logIds);
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
                .replace('{1}', logIds.length.toString()));
        }
        return { success, deletedCount, totalRecords: logIds.length };
    }
}
exports.default = Delete;
Delete.description = messages.getMessage('commandDescription');
Delete.examples = [
    `$ sfdx bm:log:delete --targetusername myOrg@example.com

Deleting debug logs for user id XXXXXXXXXXXXXXXXX
Successfully deleted 1 debug log
`,
    `$ sfdx bm:log:delete --targetusername myOrg@example.com -a

Deleting debug logs for all users
Successfully deleted 3 debug logs
`
];
Delete.args = [{ name: 'file' }];
Delete.flagsConfig = {
    all: command_1.flags.boolean({ char: 'a', description: messages.getMessage('allFlagDescription') })
};
// Comment this out if your command does not require an org username
Delete.requiresUsername = true;
// Comment this out if your command does not support a hub org username
// protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Delete.requiresProject = false;
//# sourceMappingURL=delete.js.map