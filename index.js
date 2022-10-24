const telegramApi = require('node-telegram-bot-api');
const {token, url, port} = require('./config');
const {trelloToken, trelloApiKey} = require('./trelloConfig');
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
        trelloConnect(chatId);
        return;
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

function trelloConnect(chatId){
    fetch(`https://api.trello.com/1/boards/NXqNnhNf/actions?key=${trelloApiKey}&token=${trelloToken}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
        }).then(response => {
            console.log(`Response: ${response.status} ${response.statusText}`);
            return response.text();
        }).then(text => {
            const actionsBoard = JSON.parse(text);
            for(let findChanges of actionsBoard){
                
                if(findChanges.type == "updateCard"){
                    const checkChanges = findChanges.data;
                    const cardName = checkChanges.card.name;

                    if('listAfter' in checkChanges){
                        const listName = checkChanges.listAfter.name;
                        return bot.sendMessage(chatId, `Card: "${cardName}" was move to list "${listName}"`);
                    }
                }
            }
        }).catch(err => console.error(err));
}