'use strict';

const https = require('https');
const url = require('url');
const util = require('util');
const querystring = require('querystring');
const TwitchError = require('./error');
const utility = require('./utility');
const extend = utility.extend;

const DEFAULT_TIMEOUT = 5000;

const API_BASE_URL = 'https://api.twitch.tv/kraken';
const API_VERSION = 'v3';

// Initialize the client.
//  [req] options.id
//  - or -
//  [req] options.client
//  [opt] options.secret = null
//  [opt] options.uri = null
//  [opt] options.timeout = 5000
//  [opt] options.baseUrl = 'https://api.twitch.tv/kraken'
//  [opt] options.version = 'v3'
//  [opt] options.agent = new https.Agent(...)
//  [opt] options.token = null
//  [opt] options.log = null
function TwitchClientCore(options) {
    // Apply defaults.
    options = extend({}, options ? options.client : undefined, options);

    // Verify arguments.
    if (!options.id) {
        throw new Error('Client ID not specified');
    }

    if (!options.agent) {
        options.agent = new https.Agent({
            keepAlive: true
        });
    }

    this.id = options.id;
    this.secret = options.secret || null;
    this.uri = options.uri || null;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.baseUrl = options.baseUrl || API_BASE_URL;
    this.version = options.version || API_VERSION;
    this.agent = options.agent;
    this.token = options.token || null;
    this.log = options.log || null;
}


// Sends a request to the API.
//  [req] method
//  [req] endpoint
//  [opt] options
//          .params = {}
//          .payload = undefined        // string || object; object => JSON.stringify
//          .contentType = undefined    // overwrites .headers['Content-Type']
//          .headers = {}
//          .timeout = this.timeout
//          .baseUrl = this.baseUrl
//          .version = this.version
//          .token = this.token
TwitchClientCore.prototype.api = function api(method, endpoint, options) {
    // Verify arguments.
    if (!method) {
        throw new Error('Method not specified');
    }
    if (!endpoint) {
        throw new Error('Endpoint not specified');
    }

    // Apply defaults.
    options = extend({
        params: {},
        headers: {},
        timeout: this.timeout,
        baseUrl: this.baseUrl,
        version: this.version,
        token: this.token
    }, options);

    // Build endpoint address.
    // Check if endpoint is already a fully qualified URL.
    if (!url.parse(endpoint).host) {
        endpoint = utility.joinPath(options.baseUrl, endpoint);
    }

    var contentType;
    if (typeof options.payload === 'object') {
        options.payload = JSON.stringify(options.payload);
        contentType = 'application/json';
    }
    contentType = options.contentType || options.headers['Content-Type'] || contentType;

    var headers = {
        'Accept': `application/vnd.twitchtv.${options.version}+json`,
        'Client-ID': this.id
    };
    if (options.token) {
        headers['Authorization'] = `OAuth ${options.token}`;
    }
    if (options.payload) {
        headers['Content-Length'] = options.payload.length;
    }
    extend(headers, options.headers);
    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    var reqOptions = url.parse(endpoint, true);
    extend(reqOptions.query, options.params);
    reqOptions.method = method;
    reqOptions.path = utility.appendQuery(reqOptions.pathname, reqOptions.query);
    reqOptions.agent = this.agent;
    reqOptions.headers = headers;
    reqOptions.encoding = 'utf8';
    reqOptions.timeout = options.timeout;
    reqOptions.payload = options.payload;

    if (this.log) {
        this.log.info('[Twitch]', url.format(reqOptions));
    }

    return utility.sendRequest(reqOptions).then((response) => {
        var result;
        try {
            result = JSON.parse(response.data);
        } catch (err) {
            result = {};
        }
        // Report an error if...
        //   ... an error object was returned.
        //   ... nothing (or invalid JSON) was returned and the
        //       HTTP request completed with an error status.
        if (result.error || (!result && response.statusCode >= 400)) {
            let statusCode = result.status || response.statusCode;
            if (!statusCode || statusCode < 400) {
                statusCode = 500;
            }
            let message = result.message || response.statusMessage || 'unknown error';
            throw new TwitchError(statusCode, message);
        }
        return result;
    });
};

// `api` with method 'GET'.
TwitchClientCore.prototype.get = function get(endpoint, options) {
    return this.api('GET', endpoint, options);
};

// `api` with method 'PUT'.
TwitchClientCore.prototype.put = function put(endpoint, options) {
    return this.api('PUT', endpoint, options);
};

// `api` with method 'DELETE'.
TwitchClientCore.prototype.del = function del(endpoint, options) {
    return this.api('DELETE', endpoint, options);
};

// `api` with method 'POST'.
TwitchClientCore.prototype.post = function post(endpoint, options) {
    return this.api('POST', endpoint, options);
};

// Generates the auth URL to redirect clients to.
// Redirect URI must have been set in the constructor.
//  [opt] options.scope = []
//  [opt] options.state = undefined
//  [opt] options.forceVerify = undefined
TwitchClientCore.prototype.getAuthUrl = function getAuthUrl(options) {
    // Apply defaults.
    options = extend({
        scope: []
    }, options);

    // Verify arguments.
    if (!this.uri) {
        throw new Error('Redirect URI not specified');
    }

    var query = {
        response_type: 'code',
        client_id: this.id,
        redirect_uri: this.uri,
        scope: options.scope.join(' ')
    };
    if (options.state) {
        query.state = options.state;
    }
    if (options.forceVerify) {
        query.force_verify = options.forceVerify;
    }

    return utility.appendQuery(utility.joinPath(this.baseUrl, '/oauth2/authorize'), query);
};

// Requests an access token from the Twitch API.
// Client secret and (if an authorization code is used)
// redirect URI must have been set in the constructor.
//  [req] options.code -or- options.refreshToken
//  [opt] options.state
//
//  result => {
//      access_token: 'OAuth access token',
//      refresh_token: 'OAuth refresh token',
//      scope: ['list', 'of', 'granted', 'scopes']
//  }
TwitchClientCore.prototype.authorize = function authorize(options) {
    // Apply defaults.
    options = extend({}, options);

    // Verify arguments.
    if (!options.code && !options.refreshToken) {
        throw new Error('Authorization code or refresh token required');
    }
    if (!this.secret) {
        throw new Error('Client secret not specified');
    }
    if (options.code && !this.uri) {
        throw new Error('Redirect URI not specified');
    }

    var data = {
        grant_type: options.code ? 'authorization_code' : 'refresh_token',
        client_id: this.id,
        client_secret: this.secret
    };
    if (options.code) {
        data.redirect_uri = this.uri;
        data.code = options.code;
    } else {
        data.refresh_token = options.refreshToken;
    }
    if (options.state) {
        data.state = options.state;
    }
    data = querystring.stringify(data);

    return this.post('/oauth2/token', {
        payload: data,
        contentType: 'application/x-www-form-urlencoded'
    });
};

module.exports = TwitchClientCore;

