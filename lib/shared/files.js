"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
/*
 * Generate a temporary directory name - current time plus a random
 * number in case an automated tool kicks off two jobs at the
 * same second.
 */
function getTmpDir() {
    const rnd = Math.floor(Math.random() * Math.floor(50));
    const dt = new Date();
    const mm = (dt.getMonth() + 101).toString().substring(1, 3);
    const dd = (dt.getDate() + 100).toString().substring(1, 3);
    const HH = (dt.getHours() + 100).toString().substring(1, 3);
    const MM = (dt.getMinutes() + 100).toString().substring(1, 3);
    const SS = (dt.getSeconds() + 100).toString().substring(1, 3);
    const ts = dt.getFullYear() + mm + dd + HH + MM + SS;
    const dirname = path_1.join('.', 'bbsfdx_' + ts + rnd);
    fs_1.mkdirSync(dirname);
    return dirname;
}
exports.getTmpDir = getTmpDir;
//# sourceMappingURL=files.js.map