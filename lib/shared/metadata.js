"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
async function deployMetadata(conn, zipFile, ux, messages, deployOptions) {
    ux.log('Deploying');
    const zipStream = fs_1.createReadStream(zipFile);
    const result = await conn.metadata.deploy(zipStream, deployOptions);
    let done = false;
    let deployResult;
    while (!done) {
        deployResult = await conn.metadata.checkDeployStatus(result.id);
        done = deployResult.done;
        if (!done) {
            ux.log(deployResult.status + messages.getMessage('sleeping'));
            await new Promise(sleep => setTimeout(sleep, 5000));
        }
    }
    return deployResult;
}
exports.deployMetadata = deployMetadata;
async function retrieveMetadata(conn, types, ux, messages) {
    const asyncRetrieve = util_1.promisify(conn.metadata.retrieve);
    const retrieveCheck = await asyncRetrieve.call(conn.metadata, {
        apiVersion: '53.0',
        singlePackage: true,
        unpackaged: {
            types
        }
    });
    let retrieveResult;
    let done = false;
    while (!done) {
        retrieveResult = await conn.metadata.checkRetrieveStatus(retrieveCheck.id);
        done = JSON.parse(retrieveResult.done.toString());
        if (!done) {
            ux.log(retrieveResult.status + messages.getMessage('sleeping'));
            await new Promise(sleep => setTimeout(sleep, 5000));
        }
    }
    return retrieveResult;
}
exports.retrieveMetadata = retrieveMetadata;
//# sourceMappingURL=metadata.js.map