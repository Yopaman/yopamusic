const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ypi = require('youtube-playlist-info');
const config = require('./config.json');
const client = new Discord.Client();

let queue = {
    urls: [],
    names: []
};
let dispatcher;

client.login(config.bot_token);
client.on('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.username}`);
});

function addPlaylist(playlistId) {
    ypi.playlistInfo(config.yt_api_key, playlistId, playlistItems => {
        let playlistLength = playlistItems.length;
        for(let i = 0; i < playlistLength; i++) {
            queue.urls.push('https://youtube.com/watch?v=' + playlistItems[i].resourceId.videoId);
        }
    });
}

const actions = {
    parse(msg) {
        let args = msg.content.split(' ');
        return args;
    },

    match(msg, command) {
        if (msg.content.startsWith('/' + command)) {
            return true;
        } else {
            return false;
        }
    },

    play(connection, msg) {
        let stream = ytdl(queue.urls[0]);
        dispatcher = connection.playStream(stream);
        dispatcher.on('end', () => {
            if (queue.urls.length === 1) {
                queue.urls = [];
                connection.disconnect();
            } else {
                queue.urls.shift();
                this.play(connection, msg);
            }
        });
        let collector = msg.channel.createCollector(m => m);
        collector.on('message', m => {
            if (m.content === '/skip') {
                dispatcher.end();
                collector.stop();
            }
        });
    }
};

client.on('message', msg => {
    if (msg.channel.type === 'dm') {
        let args = actions.parse(msg);
        if (actions.match(msg, 'play')) {
            if (queue.urls.length < 1) {
                let match = args[1].match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/);
                if (match && match[2]) {
                    addPlaylist(match[2]);
                    client.guilds.get(config.server_id).members.get(msg.author.id).voiceChannel.join()
                    .then(connection => {
                        actions.play(connection, msg);
                    });
                } else {
                    client.guilds.get(config.server_id).members.get(msg.author.id).voiceChannel.join()
                    .then(connection => {
                        queue.urls.push(url);
                        actions.play(connection, msg);
                    });
                }
            } else {
                let match = args[1].match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/);
                if (match && match[2]) {
                    addPlaylist(match[2]);
                } else {
                    queue.urls.push(args[1]);
                }
            }
        }
    }
});
