'use strict';

const util = require('util');
const querystring = require('querystring');
const utility = require('./utility');
const extend = utility.extend;
const TwitchClientCore = require('./core');


function TwitchClient(options) {
    TwitchClientCore.call(this, options);
}

util.inherits(TwitchClient, TwitchClientCore);

//
// blocks.md
//

// GET /users/:user/blocks
TwitchClient.prototype.getBlocks = function getBlocks(user, options) {
    return this.get(`/users/${user}/blocks`, options);
};

// PUT /users/:user/blocks/:target
TwitchClient.prototype.addBlock = function addBlock(user, target, options) {
    return this.put(`/users/${user}/blocks/${target}`, options);
};

// DELETE /users/:user/blocks/:target
TwitchClient.prototype.removeBlock = function removeBlock(user, target, options) {
    return this.del(`/users/${user}/blocks/${target}`, options);
};

//
// channels.md
//

// GET /channels/:channel
TwitchClient.prototype.getChannel = function getChannel(channel, options) {
    return this.get(`/channels/${channel}`, options);
};

// GET /channel
TwitchClient.prototype.getMyChannel = function getMyChannel(channel, options) {
    return this.get('/channel', options);
};

// GET /channels/:channel/videos
//   see videos.md

// GET /channels/:channel/follows
//   see follows.md

// GET /channels/:channel/editors
TwitchClient.prototype.getChannelEditors = function getChannelEditors(channel, options) {
    return this.get(`/channels/${channel}/editors`, options);
};

// PUT /channels/:channel
TwitchClient.prototype.updateChannel = function updateChannel(channel, data, options) {
    if (!data || !data.channel) {
        data = {channel: data};
    }
    options = extend({payload: data}, options);
    return this.put(`/channels/${channel}`, options);
}

// DELETE /channels/:channel/stream_key
TwitchClient.prototype.resetStreamKey = function resetStreamKey(channel, options) {
    return this.del(`/channels/${channel}/stream_key`, options);
};

// POST /channels/:channel/commercial
TwitchClient.prototype.runCommercial = function runCommercial(channel, length, options) {
    if (typeof length === 'object') {
        options = length;
        length = undefined;
    }
    if (length) {
        let data = {length: length};
        options = extend({payload: data}, options);
    }
    return this.post(`/channels/${channel}/commercial`, options);
};

// GET /channels/:channel/teams
TwitchClient.prototype.getChannelTeams = function getChannelTeams(channel, options) {
    return this.get(`/channels/${channel}/teams`, options);
};

//
// chat.md
//

// GET /chat/:channel
//TwitchClient.prototype.getChatLinks = function getChatLinks(channel, options) {
//    return this.get(`/chat/${channel}`, options);
//};

// GET /chat/:channel/badges
TwitchClient.prototype.getChatBadges = function getChatBadges(channel, options) {
    return this.get(`/chat/${channel}/badges`, options);
};

// GET /chat/emoticons
TwitchClient.prototype.getEmotes = function getEmotes(options) {
    return this.get('/chat/emoticons', options);
};

// GET /chat/emoticon_images
TwitchClient.prototype.getEmoteImages = function getEmoteImages(options) {
    return this.get('/chat/emoticon_images', options);
};

//
// follows.md
//

// GET /channels/:channel/follows
TwitchClient.prototype.getFollowers = function getFollowers(channel, options) {
    return this.get(`/channels/${channel}/follows`, options);
};

// GET /users/:user/follows/channels
TwitchClient.prototype.getFollowedChannels = function getFollowedChannels(user, options) {
    return this.get(`/users/${user}/follows/channels`, options);
};

// GET /users/:user/follows/channels/:target
TwitchClient.prototype.getFollowStatus = function getFollowStatus(user, target, options) {
    return this.get(`/users/${user}/follows/channels/${target}`, options);
};

// PUT /users/:user/follows/channels/:target
TwitchClient.prototype.followChannel = function followChannel(user, target, options) {
    return this.put(`/users/${user}/follows/channels/${target}`, options);
};

// DELETE /users/:user/follows/channels/:target
TwitchClient.prototype.unfollowChannel = function unfollowChannel(user, target, options) {
    return this.del(`/users/${user}/follows/channels/${target}`, options);
};

// GET /streams/followed
//   see users.md

//
// games.md
//

// GET /games/top
TwitchClient.prototype.getTopGames = function getTopGames(options) {
    return this.get('/games/top', options);
};

//
// ingests.md
//

// GET /ingests
TwitchClient.prototype.getIngests = function getIngests(options) {
    return this.get('/ingests', options);
};

//
// root.md
//

// GET /
TwitchClient.prototype.getRoot = function getRoot(options) {
    return this.get('/', options);
};

//
// search.md
//

// GET /search/channels
TwitchClient.prototype.searchChannels = function searchChannels(query, options) {
    options = extend({}, options);
    options.params = extend({query: query}, options.params);
    return this.get('/search/channels', options);
};

// GET /search/streams
TwitchClient.prototype.searchStreams = function searchStreams(query, options) {
    options = extend({}, options);
    options.params = extend({query: query}, options.params);
    return this.get('/search/streams', options);
};

// GET /search/games
TwitchClient.prototype.searchGames = function searchGames(query, options) {
    options = extend({}, options);
    options.params = extend({query: query, type: 'suggest'}, options.params);
    return this.get('/search/games', options);
};

//
// streams.md
//

// GET /streams/:channel
TwitchClient.prototype.getStream = function getStream(channel, options) {
    // TODO: format params (channels=a,b,c)
    return this.get(`/streams/${channel}`, options);
};

// GET /streams
TwitchClient.prototype.getStreams = function getStreams(options) {
    return this.get('/streams', options);
};

// GET /streams/featured
TwitchClient.prototype.getFeaturedStreams = function getFeaturedStreams(options) {
    return this.get('/streams/featured', options);
};

// GET /streams/summary
TwitchClient.prototype.getStreamSummary = function getStreamSummary(options) {
    return this.get('/streams/summary', options);
};

// GET /streams/followed
//   see users.md

//
// subscriptions.md
//

// GET /channels/:channel/subscriptions
TwitchClient.prototype.getSubscribers = function getSubscribers(channel, options) {
    return this.get(`/channels/${channel}/subscriptions`, options);
};

// GET /channels/:channel/subscriptions/:user
TwitchClient.prototype.getSubscriberStatus = function getSubscriberStatus(channel, user, options) {
    return this.get(`/channels/${channel}/subscriptions/${user}`, options);
};

// GET /users/:user/subscriptions/:channel
//   name?!
TwitchClient.prototype.getSubscriberStatus2 = function getSubscriberStatus2(user, channel, options) {
    return this.get(`/users/${user}/subscriptions/${channel}`, options);
};

//
// teams.md
//

// GET /teams
TwitchClient.prototype.getTeams = function getTeams(options) {
    return this.get('/teams', options);
};

// GET /teams/:team
TwitchClient.prototype.getTeam = function getTeam(team, options) {
    return this.get(`/teams/${team}`, options);
};

//
// users.md
//

// GET /users/:user
TwitchClient.prototype.getUser = function getUser(user, options) {
    return this.get(`/users/${user}`, options);
};

// GET /user
TwitchClient.prototype.getMyUser = function getMyUser(options) {
    return this.get('/user', options);
};

// GET /streams/followed
TwitchClient.prototype.getFollowedStreams = function getFollowedStreams(options) {
    return this.get('/streams/followed', options);
};

// GET /videos/followed
TwitchClient.prototype.getFollowedVideos = function getFollowedVideos(options) {
    return this.get('/videos/followed', options);
};

//
// videos.md
//

// GET /videos/:id
TwitchClient.prototype.getVideo = function getVideo(id, options) {
    return this.get(`/videos/${id}`, options);
};

// GET /videos/top
TwitchClient.prototype.getTopVideos = function getTopVideos(options) {
    return this.get('/videos/top', options);
};

// GET /channels/:channel/videos
TwitchClient.prototype.getChannelVideos = function getChannelVideos(channel, options) {
    return this.get(`/channels/${channel}/videos`, options);
};

// GET /videos/followed
//   see users.md


module.exports = TwitchClient;

