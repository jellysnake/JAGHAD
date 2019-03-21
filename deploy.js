"use strict";
const {exec} = require("child_process");

const config = require("./config.json");
const simpleGit = require('simple-git/promise')(config.localPath);

function tryPullGit() {
    return simpleGit.clean("f")
        .then(() => simpleGit.pull("origin", config.branch || "master"))
        .then(() => console.log("Finished pulling from remote"))
        .catch(() => console.log("Unable to pull from remote"));
}

function runBashCommand() {
    if (!config.deployScript) {
        return Promise.resolve("No deploy script specified.");
    }
    return new Promise((resolve, reject) => {
        exec(config.deployScript, (err, stdout, stderr) => {
            if (err) {
                reject(err.code);
            } else {
                resolve(stdout);
            }
        })
    })
}

module.exports = {tryPullGit, runBashCommand};
