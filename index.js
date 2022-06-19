require('dotenv').config(); //parse .env file for process.env.*

const Parser = require('rss-parser');
const TelegramBotApi = require('node-telegram-bot-api');
const os = require("os");

const utils = require('./utils');

let parser = new Parser();
let bot = new TelegramBotApi(process.env.TOKEN, {polling: true});

const date = new Date();

console.log(`Стартанули: ${utils.pad(date.getDate())}.${utils.pad(date.getMonth() + 1)}.${date.getFullYear()} - ${utils.pad(date.getHours())}:${utils.pad(date.getMinutes())}:${utils.pad(date.getSeconds())}`);

botCommands = [
    {
        command: 'start',
        description: 'Кликай'
    },
    {
        command: 'rss',
        description: 'Вывод последних постов с указанной ленты'
    },
    {
        command: 'info',
        description: 'Инфа о боте'
    }
];

bot.setMyCommands(botCommands).then(r => console.log('Команды бота добавлены'));

bot.onText(/\/start/, (msg) => {
    let chatId = msg.chat.id;

    let botOptions = {};

    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        botOptions = {
            reply_to_message_id: msg.message_id
        };
    }

    let answer = 'Привет!\n';
    answer += 'Я бот';

    bot.sendMessage(chatId, answer, botOptions);
})

bot.onText(/\/rss (.+)/, async (msg, match) => {
    try {
        let chatId = msg.chat.id;
        let rss_url = match[1];

        const botOptions = {
            reply_to_message_id: msg.message_id,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        };

        if (!utils.isValidURL(rss_url)) {
            await bot.sendMessage(chatId, 'Укажите <code>rss</code> ленту с которой хотите получить информацию.\nПример: <code>/rss https://reddit.com/.rss</code>', botOptions);

            return;
        }

        let feed = await parser.parseURL(rss_url);
        let answer = `Последние посты с <a href=\"${feed.link}\">${feed.title}</a>\n\n`;

        let items = feed.items;

        for (let i = 0; i < items.length; i++) {
            answer += `${i + 1}. <a href=\"${items[i].link}\">${items[i].title}</a>\n`;

            if (i >= 9) break;
        }

        await bot.sendMessage(chatId, answer, botOptions)
    } catch (err) {
        console.log(err);
    }
})

bot.onText(/\/info/, (msg) => {
    let chatId = msg.chat.id;

    let botOptions = {};

    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        botOptions = {
            reply_to_message_id: msg.message_id
        };
    }

    let answer = 'Привет!\n\n';
    answer += `Аптайм ${utils.formatTime(process.uptime())}\n`;
    answer += `Платформа ${os.platform()}`;

    bot.sendMessage(chatId, answer, botOptions);
})