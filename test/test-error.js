'use strict';

const assert = require('assert');
const TwitchError = require('../lib/error');

describe('TwitchError', function() {
    describe('constructor', function() {
        var statusCode = 404;
        var message = 'test message';
        var err = new TwitchError(statusCode, message);
        it('should be instance of TwitchError', function() {
            assert(err instanceof TwitchError);
        });
        it('should be instance of Error', function() {
            assert(err instanceof Error);
        });
        it('name should be TwitchError', function() {
            assert(err.name === 'TwitchError');
        });
        it('err.message should be set', function() {
            assert(err.message === message);
        });
        it('err.statusCode should be set', function() {
            assert(err.statusCode === statusCode);
        });
        it('err.stack should be set', function() {
            assert(err.stack);
        });
    });
});

