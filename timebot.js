/**
 * Created by mporkola on 9.12.2016.
 */
const Botkit = require('botkit');

const controller = Botkit.slackbot({
  debug: false,
  json_file_store: './hours.json'
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
    token: 'xoxb-114742257010-w0oqdDLFVllRFtKL6oLJkOfZ',
}).startRTM();

// give the bot something to listen for.
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {

  bot.reply(message,'Hello yourself.');

});

// https://regex101.com/r/7BPZaf/2
controller.hears(['([-+][0-9]+([,:][0-9]+)?)'],['direct_message','direct_mention','mention'],function(bot,message) {

  bot.reply(message,'OK so in total ' + parseTime(message));
});

// https://regex101.com/r/7BPZaf/4
const parseTime = (message) => {
  const [, sign, hours, , separator, minOrFraction] = message.text.match(/([-+])?([0-9]+)(([,:])([0-9]+))?/);
  const minutes = parseInt(minOrFraction); // TODO: implement decimal alternative for ',' separator, e.g. '1,5 hours'
  const totalMinutes = parseInt(hours) * 60 + (minutes || 0);
  console.log('totalMinutes', totalMinutes);
  const totalDelta = (sign === '-' ? -1 : 1) * totalMinutes;

  console.log('parsed:', [sign, hours, separator, minOrFraction]);
  console.log('message', message);
  let stored = 0;
  controller.storage.users.get(message.user, (err, user_data) => {
    if (err) {
      console.error(err);
    } else if (user_data) {
      console.log('user data', user_data);
      stored = user_data.stored;
    }
  });
  console.log('stored data', controller.storage.users.get(message.user));
  const newHours = parseInt(stored) + totalDelta;
  console.log(`newhours ${newHours}, stored ${stored}, totaldelta ${totalDelta}`);
  controller.storage.users.save({ id: message.user, stored: newHours }, (err) => console.error(err));
  return newHours;
};
