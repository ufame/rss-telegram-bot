require('dotenv').config(); //parse .env file for process.env.*

const Parser = require('rss-parser');
const TelegramBotApi = require('node-telegram-bot-api');
const os = require("os");

let parser = new Parser();
let bot = new TelegramBotApi(process.env.TOKEN, {polling: true});

const date = new Date();

console.log(`Запуск ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`);

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

bot.setMyCommands(botCommands);

bot.onText(/\/start/, function (msg) {
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

bot.onText(/\/rss (.+)/, function (msg, match) {
    let chatId = msg.chat.id;
    let rss_url = match[1];

    const botOptions = {
        reply_to_message_id: msg.message_id,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    };

    if (!isValidURL(rss_url)) {
        bot.sendMessage(chatId, 'Укажите <code>rss</code> ленту с которой хотите получить информацию.\nПример: <code>/rss https://reddit.com/.rss</code>', botOptions)
            .catch(err => {
                console.log(err);
            });

        return;
    }

    (async () => {
        let feed = await parser.parseURL(rss_url);
        let answer = `Последние посты с ${rss_url}\n\n`;

        feed.items.every(function (element, index) {
            answer += `${index + 1}. <a href=\"${element.link}\">${element.title}</a>\n`;

            return index + 1 < 10;
        });

        bot.sendMessage(chatId, answer, botOptions)
            .catch(err => {
                console.log(err);
            });
    })();
})

bot.onText(/\/info/, function (msg) {
    let chatId = msg.chat.id;

    let botOptions = {};

    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        botOptions = {
            reply_to_message_id: msg.message_id
        };
    }

    let answer = 'Привет!\n\n';
    answer += `Аптайм ${format(process.uptime())}\n`;
    answer += `Платформа ${os.platform()}`;

    bot.sendMessage(chatId, answer, botOptions);
})

function isValidURL(string) {
    let res = string.match(/https?:\/\/.?(www\.)?[-a-zA-Z\d@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z\d@:%_+.~#?&/=]*)/g);

    return (res !== null)
}

function format(seconds) {
    let hrs = Math.floor(seconds / (60 * 60));
    let min = Math.floor(seconds % (60 * 60) / 60);
    let sec = Math.floor(seconds % 60);

    return pad(hrs) + ':' + pad(min) + ':' + pad(sec);
}

function pad(num) {
    return (num < 10 ? '0' : '') + num;
}