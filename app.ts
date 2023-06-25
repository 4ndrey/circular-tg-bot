import { Bot, webhookCallback } from "grammy";
import express from "express";
import fetch from "node-fetch";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// Handle the /pair command to pair a watch
bot.command("pair", async ctx => { 
  const userId = ctx.from?.id
  const response = await fetch(`https://circular-api.cyclic.app/watch/pair`, 
    { method: 'post', headers: {'id': ctx.message!.text.split(' ')[1], 'userId': ctx.from!.id.toString()} }
  );
  if (response.status == 200) {
    ctx.reply('Paired!') 
  } else {
    ctx.reply('Failed :(') 
  }
});

// Handle the /note command for the watch
bot.command("note", async ctx => { 
  const userId = ctx.from?.id
  const response = await fetch(`https://circular-api.cyclic.app/watch/note`, 
    { method: 'post', headers: {'note': ctx.message!.text.split(' ')[1], 'userId': ctx.from!.id.toString()} }
  );
  if (response.status == 200) {
    ctx.reply('ok') 
  } else {
    ctx.reply('Failed :(') 
  }
});

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "note", description: "Update a note" },
  {
    command: "pair",
    description: "Pair your Garmin watch",
  },
]);

// // Handle all other messages and the /start command
// const introductionMessage = `Hello! I'm a Telegram bot.
// I'm powered by Cyclic, the next-generation serverless computing platform.

// <b>Commands</b>
// /yo - Be greeted by me
// /effect [text] - Show a keyboard to apply text effects to [text]`;

// const replyWithIntro = (ctx: any) =>
//   ctx.reply(introductionMessage);

// bot.command("start", replyWithIntro);
// bot.on("message", replyWithIntro);

// Start the server
if (process.env.ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
