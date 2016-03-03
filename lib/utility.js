'use strict';

const https = require('https');
const url = require('url');
const querystring = require('querystring');

// utility.extend(target, *sources);
// Copies values from source to target while skipping
// keys with undefined values.
function extend(target) {
    for (var i = 1; i < arguments.length; ++i) {
        var source = arguments[i];
        // Don't do anything if source isn't an object.
        if (source === null || typeof source !== 'object') {
            continue;
        }
        var keys = Object.keys(source);
        var k = keys.length;
        while (k--) {
            var key = keys[k];
            // Skip undefined values.
            if (typeof source[key] !== 'undefined') {
                target[key] = source[key];
            }
        }
    }
    return target;
}

function joinPath(path) {
    for (var i = 1; i < arguments.length; ++i) {
        var part = arguments[i];
        if (part.startsWith('/')) {
            part = part.substr(1)
        }
        if (!path.endsWith('/')) {
            path += '/';
        }
        path += part;
    }
    return path;
}

function formatEndpoint(format, data) {
    if (typeof data === 'undefined') {
        data = {};
    }
    format = format.split('/');
    var result = [];
    for (var i = 0; i < format.length; i++) {
        var part = format[i];
        if (part.charAt(0) === ':') {
            part = part.substr(1);
            result.push(data[part]);
        } else {
            result.push(part);
        }
    }
    return result.join('/');
}

function appendQuery(baseUrl, query) {
    baseUrl = url.parse(baseUrl, true);
    query = extend(baseUrl.query || {}, query);
    query = querystring.stringify(query);
    if (query) {
        baseUrl.search = `?${query}`;
    }
    return url.format(baseUrl);
}

// [req] options - same as https.request, plus:
//  {
//      encoding: undefined, // res.setEncoding(...)
//      timeout: undefined,  // req.setTimeout(...)
//      payload: undefined   // req.write(...)
//  }
function sendRequest(options) {
    return new Promise((resolve, reject) => {
        var req = https.request(options, (res) => {
            var data = '';
            if (options.encoding) {
                res.setEncoding(options.encoding);
            }
            res.on('data', (chunk) => {
                // Accumulate received chunks.
                data += chunk;
            });
            res.on('end', () => {
                res.data = data;
                resolve(res);
            });
        });
        req.on('error', (err) => {
            reject(err);
        });
        if (options.timeout) {
            req.setTimeout(options.timeout);
        }
        if (options.payload) {
            req.write(options.payload);
        }
        req.end();
    });
}

module.exports = {
    extend: extend,
    joinPath: joinPath,
    formatEndpoint: formatEndpoint,
    appendQuery: appendQuery,
    sendRequest: sendRequest
};
