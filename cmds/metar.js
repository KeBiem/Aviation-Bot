const ADDS = require('adds')
const Discord = require("discord.js");



module.exports.run = async (bot, message, args) => {


let icao = args[0];

ADDS('metars', {
  stationString: icao,
  hoursBeforeNow: 1
})
  .then(metars => {
    console.log(JSON.stringify(metars, null, 1))

    let membed = new Discord.RichEmbed()
    .setTitle(`**METAR for ${metars[0].station_id}**`)
    .setDescription(`**${metars[0].raw_text}**`);
    // .addField("**Station**:", `${metars[0].station_id}`)
    // .addField("**Observed at:**", `${metars[0].observation_time}`)
    // .addField("**Temperature:**", `${metars[0].temp_c}°C`)
    // .addField("**Dewpoint:**", `${metars[0].dewpoint_c}°C`)
    // .addField("**Winds:**", `${metars[0].wind_dir_degrees} At ${metars[0].wind_speed_kt}Knots`)
    // .addField("**Visibility:**", `${metars[0].visibility_statute_mi}mi`)
    // .addField("**Pressure:**", `${metars[0].altim_in_hg}hPa`);

    message.channel.send(membed);

  })



}

module.exports.help = {
  name: "metar"
}
