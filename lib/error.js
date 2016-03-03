'use strict';

const util = require('util');
const extend = require('./utility').extend;

function BaseError(message, options) {
    //Error.call(this, message);
    var ctor = (options && options.ctor) || this.constructor;
    Error.captureStackTrace(this, ctor);
    Object.defineProperty(this, 'name', {
        value: this.constructor.name,
        enumerable: false,
        writable: true,
        configurable: true
    });
    Object.defineProperty(this, 'message', {
        value: message,
        enumerable: false,
        writable: true,
        configurable: true
    });
}

util.inherits(BaseError, Error);

function TwitchError(statusCode, message, options) {
    BaseError.call(this, message, options);
    this.statusCode = statusCode;
}

util.inherits(TwitchError, BaseError);

module.exports = TwitchError;

