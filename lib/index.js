'use strict';

const TwitchClientCore = require('./core');
const TwitchClient = require('./client');
const TwitchError = require('./error');
//const utility = require('./utility');

function createClient(options) {
    return new TwitchClient(options);
};

exports = module.exports = createClient;
exports.ClientCore = TwitchClientCore;
exports.Client = TwitchClient;
exports.Error = TwitchError;

