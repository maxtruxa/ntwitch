'use strict';

const assert = require('assert');
const fs = require('fs');
const ntwitch = require('../index');

//{
//     credentials: {
//         id: '<id>',
//         secret: '<secret>',
//         uri: '<uri>',
//         token: '<token>',
//     },
//     data: {
//         user: 'test_user1',
//         channel: 'test_user1',
//         team: 'test',
//     }
// }
const config = require('./test-config');

const user = config.data.user;
const channel = config.data.channel;
const team = config.data.team;

describe('Client', function() {
    var client = ntwitch(config.credentials);

    this.timeout(client.timeout + 1000);
    this.slow(client.timeout);

    describe('.getAuthUrl()', function() {
        it('basic', function() {
            var uri = client.getAuthUrl();
            assert(uri);
        });
        it('with scopes', function() {
            var uri = client.getAuthUrl({
                scope: [
                    'user_read',
                    'user_blocks_edit',
                    'user_blocks_read',
                    'user_follows_edit',
                    'channel_read',
                    'channel_editor',
                    'channel_commercial',
                    'channel_stream',
                    'channel_subscriptions',
                    'user_subscriptions',
                    'channel_check_subscription',
                    'chat_login'
                ]
            });
            assert(uri);
        });
    });

    var tests = [
        // blocks.md
        //{ name: 'getBlocks',            args: [user] },
        //{ name: 'addBlock',             args: [user, target] },
        //{ name: 'removeBlock',          args: [user, target] },

        // channels.md
        { name: 'getChannel',           args: [channel] },
        //{ name: 'getMyChannel',         args: [channel] },
        //{ name: 'getChannelEditors',    args: [channel] },
        //{ name: 'updateChannel',        args: [channel, data] },
        //{ name: 'resetStreamKey',       args: [channel] },
        //{ name: 'runCommercial',        args: [channel, length] },
        { name: 'getChannelTeams',      args: [channel] },

        // chat.md
        //{ name: 'getChatLinks',         args: [channel] },
        { name: 'getChatBadges',        args: [channel] },
        { name: 'getEmotes',            args: [] },
        { name: 'getEmoteImages',       args: [] },

        // follows.md
        { name: 'getFollowers',         args: [channel] },
        { name: 'getFollowedChannels',  args: [user] },
        //{ name: 'getFollowStatus',      args: [user, channel] },
        //{ name: 'followChannel',        args: [user, channel] },
        //{ name: 'unfollowChannel',      args: [user, channel] },

        // games.md
        { name: 'getTopGames',          args: [] },

        // ingests.md
        { name: 'getIngests',           args: [] },

        // root.md
        { name: 'getRoot',              args: [] },

        // search.md
        { name: 'searchChannels',       args: [channel] },
        { name: 'searchStreams',        args: [channel] },
        { name: 'searchGames',          args: ['Destiny'] },

        // streams.md
        { name: 'getStream',            args: [channel] },
        { name: 'getStreams',           args: [] },
        { name: 'getFeaturedStreams',   args: [] },
        { name: 'getStreamSummary',     args: [] },

        // subscriptions.md
        //{ name: 'getSubscribers',       args: [channel] },
        //{ name: 'getSubscriberStatus',  args: [channel, user] },
        //{ name: 'getSubscriberStatus2', args: [user, channel] },

        // teams.md
        { name: 'getTeams',             args: [] },
        { name: 'getTeam',              args: [team] },

        // users.md
        { name: 'getUser',              args: [user] },
        //{ name: 'getMyUser',            args: [] },
        //{ name: 'getFollowedStreams',   args: [] },
        //{ name: 'getFollowedVideos',    args: [] },

        // videos.md
        //{ name: 'getVideo',             args: [videoId] },
        { name: 'getTopVideos',         args: [] },
        { name: 'getChannelVideos',     args: [channel] },
    ];

    tests.forEach((test) => {
        describe(`.${test.name}()`, function() {
            it (`(${test.args.join(', ')})`, function(done) {
                client[test.name].apply(client, test.args)
                    .then((data) => {
                        assert(data);
                        done();
                    })
                    .catch(done);
            });
        });
    });

});

