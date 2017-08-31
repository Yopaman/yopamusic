const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const config = require('./config.json');
const client = new Discord.Client();
client.login(config.bot_token);

let queue = [];

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

    play(url) {

    }
};

client.on('message', msg => {
    if (msg.channel.type === 'dm') {
        let args = msg.parse(msg);
        if (actions.match(msg, play)) {

        }
    }
});
