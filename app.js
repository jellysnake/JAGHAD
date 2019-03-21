"use strict";
const express = require('express');
const {checkSecret, verifyConfig, checkGithubEvent} = require("./verify.js");
const {tryPullGit, runBashCommand} = require("./deploy.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

/* Verify the config */
verifyConfig();

/* Listen to post requests */
app.post("/", postReceived);
app.listen(3000);
console.log("Updater running");

/**
 * Called when a post request is sent to the server
 * @param request  The request sent
 * @param response An object to use to send responses
 */
function postReceived(request, response) {
    let githubEvent = request.headers["x-github-event"];
    let remoteHash = request.headers["x-hub-signature"];
    let body = request.body;
    if (!checkSecret(remoteHash, body)) {
        response.status("403");
        response.send("Incorrect secret");
        console.error("Warning: Request was received with wrong secret.");
        return
    }
    response.send("Webhook received.");
    if (!checkGithubEvent(githubEvent)) {
        return
    }

    /* Actually handle the webhook */
    tryPullGit()
        .then(() => runBashCommand())
        .then(output => console.log(`\n${output}\n\nFinished deploying!`));
}


module.exports = app;
