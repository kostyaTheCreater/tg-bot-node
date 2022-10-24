const telegramApi = require('node-telegram-bot-api');

const {token, url} = require('./config');

const bot = new telegramApi(token,  {
    webHook: {
        port: 3000
    }
});

bot.setWebHook(url);

bot.setMyCommands([
    {command: '/start', description: 'Greeting'},
    {command: '/info', description: 'Get info'},
])

bot.addListener('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if(text == '/start'){
        await bot.sendMessage(chatId, 'Hello, bro');
        return;
    }
    if(text == '/info'){
        await bot.sendMessage(chatId, `Hello ${msg.from.first_name}`);
        return;
    }
    return bot.sendMessage(chatId, "I dont know, how answer on this");
})