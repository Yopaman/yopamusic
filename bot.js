const Discord = require('discord.js');
const ytdl = require('ytdl-core');
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

    play(url, connection, msg, isFirstTime) {
        if (isFirstTime === true) {queue.urls.push(url)}
        let stream = ytdl(queue.urls[0]);
        dispatcher = connection.playStream(stream);
        dispatcher.on('end', () => {
            if (queue.urls.length === 1) {
                queue.urls = [];
                connection.disconnect();
            } else {
                queue.urls.shift();
                this.play(queue[0], connection, msg, false);
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
                client.guilds.get(config.server_id).members.get(msg.author.id).voiceChannel.join()
                .then(connection => {
                    actions.play(args[1],connection, msg, true);
                });
            } else {
                queue.urls.push(args[1]);
            }
        }
    }
});
