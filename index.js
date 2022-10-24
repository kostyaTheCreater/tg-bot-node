const telegramApi = require('node-telegram-bot-api');
const {token, url, port} = require('./config');
const Pool = require("pg").Pool;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const bot = new telegramApi(token,  {
    webHook: {
        port: port
    }
});

bot.setWebHook(url);

bot.setMyCommands([
    {command: '/start', description: 'Greeting'},
    {command: '/info', description: 'Get info'},
])

bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    const userId = msg.from.id;

    if(text == '/start'){
        dbConnect(firstName, userId);
        return bot.sendMessage(chatId, `Hello, ${firstName}`);
    }
    if(text == '/info'){
        return bot.sendMessage(chatId, `Ur name is ${firstName}?`);
    }
    return bot.sendMessage(chatId, "I dont know, how answer on this");
})

function dbConnect(firstName, userId){
    try{
        pool.connect();
        pool.query(`SELECT user_id
        FROM public.users 
        WHERE user_id = ${userId}`, (err, res) => {
            if (err) throw err;
            console.log(JSON.stringify(res.rows));
            const isExsist = res.rows.length;
            if(!isExsist){
                pool.query(`INSERT INTO public.users (id, firstname, user_id) VALUES (DEFAULT, '${firstName}', ${userId})`);
            }   
        })
    }catch(e){
        console.log(e);
    }
}