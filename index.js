const botconfig = require("./botconfig.json")

const Discord = require("discord.js");
const fs = require("fs");

const prefix = botconfig.prefix
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const search = require("youtube-search-promise");
const opts = {
  maxResults: 1,
  key: process.env.googlekey
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

fs.readdir("./cmds/", (err, files) => {
  if(err) console.error(err);

  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0) {
    console.log("No commands to load!");
    return;
  }

  console.log(`Loading ${jsfiles.length} commands!`);

  jsfiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    console.log(`${i + 1}: ${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });

});

bot.on('ready', async () => {
  console.log(`Bot is ready! ${bot.user.username}`);
  bot.user.setActivity(`with ${bot.guilds.size} servers | a!help`);

  try {
    let link = await bot.generateInvite(["ADMINISTRATOR"]);
    console.log(link);
  } catch(e) {
    console.log(e.stack);
  }
});


bot.on('message', async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return message.channel.send("Please use");

  let messageArray = message.content.split(" ");
  let command = messageArray[0];
  let args = messageArray.slice(1);

  if(!command.startsWith(prefix)) return;

  let cmd = bot.commands.get(command.slice(prefix.length));
  if(cmd) cmd.run(bot, message, args);

//music commands
//playt is back-up
if(command === `${prefix}playt`) {
      //play
      if (!args[0]) {
         message.channel.send("Please specify a link");
         return
      }

      if(!message.member.voiceChannel) {
        message.channel.send("I think it may work better if you are in a voice channel!");
      }

      if(!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
      };

      var server = servers[message.guild.id];

      server.queue.push(args[0]);
      message.channel.send("Your song of choice is on the queue. ")
      if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
        play(connection, message);
      })
    }

if(command === `${prefix}play`){
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
       message.channel.send(`Added **${results[0].title}** to the queue.`);
       if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
         play(connection, message);
         console.log(server.queue[0]);
       })

   })
   .catch(error => {
     console.log(error);
   });

}
if(command === `${prefix}skip`){
  var server = servers[message.guild.id];
  if (server.dispatcher) server.dispatcher.end();
}
if(command === `${prefix}stop`){
  var server = servers[message.guild.id];

  if(message.guild.voiceConnection) message.member.voiceChannel.leave();
  message.channel.send("Left the Voice Channel!");
}
if(command === `${prefix}pause`){
  var server = servers[message.guild.id];
  if(server.dispatcher) server.dispatcher.pause();
}
if(command === `${prefix}resume`){
  var server = servers[message.guild.id];
  if(server.dispatcher) server.dispatcher.resume();
}
if(command === `${prefix}volume`){

  let number = args[0];
  if(!number) return message.channel.send("Please provide the volume %!");
  let onumber = number / 100;
  console.log(onumber);

   var server = servers[message.guild.id];
   if(server.dispatcher) server.dispatcher.setVolume(onumber);

}

});

bot.login(process.env.BOT_TOKEN);
