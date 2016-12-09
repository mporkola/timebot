/**
 * Created by mporkola on 9.12.2016.
 */
const Botkit = require('botkit');
const redisConfig = {};
const redisStorage = require('botkit-storage-redis')(redisConfig);

const controller = Botkit.slackbot({
  debug: false,
  storage: redisStorage
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
    token: process.env.SLACK_KEY,
}).startRTM();

// https://regex101.com/r/7BPZaf/2
controller.hears(['([-+][0-9]+([,:][0-9]+)?)'],['direct_message','direct_mention','mention'],function(bot,message) {
  const delta = parseTime(message);
  controller.storage.users.get(message.user, (err, user_data) => {
    if (err) {
      console.error(err);
    } else if (user_data) {
      const stored = user_data.stored;
      const newHours = parseInt(stored) + delta;
      controller.storage.users.save({ id: message.user, stored: newHours }, (err) => console.error(err));
      bot.reply(message, 'OK! '+newHours+' minutes in total');
    }
  });
});

// https://regex101.com/r/7BPZaf/4
const parseTime = (message) => {
  const [, sign, hours, , separator, minOrFraction] = message.text.match(/([-+])?([0-9]+)(([,:])([0-9]+))?/);
  const minutes = parseInt(minOrFraction); // TODO: implement decimal alternative for ',' separator, e.g. '1,5 hours'
  const totalMinutes = parseInt(hours) * 60 + (minutes || 0);
  return totalDelta = (sign === '-' ? -1 : 1) * totalMinutes;
};
