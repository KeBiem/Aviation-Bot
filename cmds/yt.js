const botconfig = require("../botconfig.json")

const Discord = require("discord.js");
const search = require("youtube-search-promise");
const opts = {
  maxResults: 1,
  key: botconfig.googlekey
};
const YTDL = require("ytdl-core");
function play(connection, message) {
    var server = servers[message.guild.id];
    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
    server.queue.shift();
    server.dispatcher.on("end", function() {
        if(server.queue[0]) play(connection, message);
        else connection.disconnect();
    })
}
var servers = {};

module.exports.run = async (bot, message, args) => {

  let video = args.join(" ");

  let data = search(video, opts)
   .then(results => {
     console.log(results[0].link);

       //play
       if (!video) {
          message.channel.send("Please specify the name of the song");
          return
       }

       if(!message.member.voiceChannel) {
         message.channel.send("I think it may work better if you are in a voice channel!");
       }

       if(!servers[message.guild.id]) servers[message.guild.id] = {
         queue: []
       };

       var server = servers[message.guild.id];

       //const id = results[0].id;

       //let vid = `https://www.youtube.com/results?search_query=${id}`

       server.queue.push(results[0].link);
       message.channel.send("Your song of choice is on the queue. ")
       if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
         play(connection, message);
       })

   })
   .catch(error => {
     console.log(error);
   });

}

module.exports.help = {
  name: "yt"
}
