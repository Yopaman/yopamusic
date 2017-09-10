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
    return new Promise((resolve, reject) => {
        ypi.playlistInfo(config.yt_api_key, playlistId, playlistItems => {
            let playlistLength = playlistItems.length;
            for (let i = 0; i < playlistLength; i++) {
                queue.urls.push('https://youtube.com/watch?v=' + playlistItems[i].resourceId.videoId);
                resolve();
                queue.names.push(playlistItems[i].title);
            }
        });
    });
}

const actions = {
    parse(msg) {
        let args = msg.content.split(' ');
        return args;
    },

    play(connection, msg) {
        let stream = ytdl(queue.urls[0], { filter : 'audioonly' });
        dispatcher = connection.playStream(stream);
        msg.reply('Lecture de : ' + queue.names[0]);
        dispatcher.on('end', (reason) => {
            if (reason != 'stop') {
                if (queue.urls.length === 1) {
                    queue.urls = [];
                    queue.names = [];
                    connection.disconnect();
                } else {
                    queue.urls.shift();
                    queue.names.shift();
                    this.play(connection, msg);
                }
            }
        });
        stream.on('error', function() {
            msg.reply('Vous n\'avez pas donné un lien youtube valide.');
            queue.urls.shift();
            this.play(connection, msg);
        });

        client.on('message', m => {
            if (m.content === '/skip') {
                collector.stop();
                dispatcher.end();
            } else if (m.content === '/stop') {
                collector.stop();
                queue.urls = [];
                queue.names = [];
                dispatcher.end('stop');
                connection.disconnect();
                m.reply('La liste de lecture a été supprimée et le bot a quitté le channel.');
            }
        });
    }
};

client.on('message', msg => {
    if (msg.channel.type === 'dm' && msg.content != '/skip' && msg.content != '/stop') {
        let args = actions.parse(msg);
        if (msg.author.id in config.users) {
            if (msg.content.startsWith('/play ')) {
                if (queue.urls.length < 1) {
                    let match = args[1].match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/);
                    if (match && match[2]) {
                        addPlaylist(match[2])
                            .then(() => {
                                client.guilds.get(config.server_id).members.get(msg.author.id).voiceChannel.join()
                                    .then(connection => {
                                        actions.play(connection, msg);
                                    });
                            });
                    } else {
                        let youtubeRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
                        if (youtubeRegex.test(args[1])) {
                            ytdl.getInfo(args[1], function(err, info) {
                                queue.names.push(info.title);
                                client.guilds.get(config.server_id).members.get(msg.author.id).voiceChannel.join()
                                    .then(connection => {
                                        queue.urls.push(args[1]);
                                        actions.play(connection, msg);
                                    });
                            });

                        } else {
                            msg.reply('Erreur : Vous n\'avez pas entré un lien youtube valide');
                            queue.urls.pop();
                        }
                    }
                } else {
                    let match = args[1].match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/);
                    if (match && match[2]) {
                        addPlaylist(match[2]);
                        msg.reply('La playlist a été ajoutée.');
                    } else {
                        queue.urls.push(args[1]);
                        try {
                            ytdl.getInfo(args[1], function(err, info) {
                                queue.names.push(info.title);
                                msg.reply('La vidéo : ' + info.title + ' a été ajoutée à la liste de lecture.');
                            });
                        } catch (e) {
                            msg.reply('Erreur : Vous n\'avez pas entré un lien youtube valide');
                            queue.urls.pop();
                        }


                    }
                }
            } else if (msg.content.startsWith('/playlistinfo')) {
                let queueInfo = 'Voici la playlist :\n',
                    queueNamesLength = queue.names.length;
                for(let i = 0; i < queueNamesLength; i++) {
                    queueInfo += queue.names[i] + ' : ' + queue.urls[i] + '\n';
                }
                msg.reply(queueInfo, {code: true, split: true});
            } else if (msg.content.startsWith('/help')) {
                msg.reply('Liste des commandes disponnibles :\n\n/play [lien youtube (playlist ou vidéo)] : Joue le son' +
                    ' de la vidéo youtube ou ajoute la vidéo à la liste de lacture.\n\n/stop : supprime la liste de' +
                    ' lecture, stoppe la musique et déconnecte le bot.\n\n/skip : passe à la musique suivante.\n\n' +
                    '/playlistinfo : affiche la liste de lacture.', {code: true});
            } else if (msg.author.bot === false) {
                msg.reply('Commande inconnue (/help pour la liste des commandes)');
            }
        } else if (msg.author.bot === false) {
            msg.reply('Vous n\'êtes pas autorisé à utiliser le bot.');
        }
    }
});
