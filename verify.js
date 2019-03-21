"use strict";
let config;
try {
    config = require("./config.json");
} catch (e) {
    throw  new Error("Missing 'config.json' file.")
}
const crypto = require('crypto');

/**
 * Verifies that the config is valid, and has any required fields.
 *
 * Throws an informative error if there are any issues
 */
function verifyConfig() {
    if (!config.secret) {
        throw new Error("Missing a secret in the config")
    }
}

/**
 * Checks that the remote secret matches the secret stored in this server
 * @param remoteHash {string} The hash given by the server
 * @param body The body to hash
 * @returns {boolean}  True if the match, false otherwise
 */
function checkSecret(remoteHash, body) {
    const hmac = crypto.createHmac("sha1", config.secret);
    hmac.update(JSON.stringify(body));
    return remoteHash.endsWith(hmac.digest('hex'));
}

/**
 * Verify that the webhook is on the whitelist of events to listen for.
 * If no whitelist is specified then it lets all of them through
 *
 * @param event The event type
 * @return {boolean} True if if it is allowed, false otherwise
 */
function checkGithubEvent(event) {
    return (typeof config.eventList === "string" || typeof config.eventList === "object") ? config.eventList.includes(event) : true;
}

module.exports = {checkSecret, verifyConfig, checkGithubEvent};