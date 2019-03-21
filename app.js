"use strict";
const express = require('express');
const Promise = require('bluebird');
const app = express();
const {eventList} = require("./config.json");

/**
 * Produces the sha1 hash of the secret located either in the config.json or in the environment variable, "GITHUB_SECRET"
 * @returns {string} The hash of the secret, if one was found
 */
function getSecretHash() {
    /* Load in the secret from config or environment & hash it */
    const secret = require("./config.json").secret || process.env.GITHUB_SECRET;
    const shasum = crypto.createHash("sha1");
    try {
        shasum.update(secret);
    } catch (e) {
        throw new Error("Missing a secret");
    }
    return shasum.digest('hex');
}

const secretHash = getSecretHash();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

/* Listen to post requests */
app.post("/", postReceived);

/**
 * Called when a post request is sent to the server
 * @param request  The request sent
 * @param response An object to use to send responses
 */
function postReceived(request, response) {
    let githubEvent = request.headers["x-github-event"];
    let remoteSecret = request.headers["x-hub-signature"];
    if (!checkSecret(remoteSecret)) {
        response.status("403");
        response.send("Incorrect secret");
        console.error("Warning: Request was received with wrong secret.");
    }

    let body = response.body;

    console.log("get!");
    response.send("Webhook received.")
}

/**
 * Checks that the remote secret matches the secret stored in this server
 * @param remoteHash {string} The hash of the remote secret
 * @returns {boolean}  True if the match, false otherwise
 */
function checkSecret(remoteHash) {
    return remoteHash.endsWith(secretHash);
}

function checkGithubEvents(event) {
    return
}

module.exports = app;
