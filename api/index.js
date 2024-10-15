/*!
 * © [2024] Malith-Rukshan. All rights reserved.
 * Repository: https://github.com/Malith-Rukshan/Auto-Reaction-Bot
 */

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import TelegramBotAPI from './TelegramBotAPI.js';
import { htmlContent, startMessage } from './constants.js';
import { splitEmojis, getRandomPositiveReaction, getChatIds } from './helper.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const botToken = "7818588156:AAG5pwQ7L80dDuyXZS4xOVTH7KlQdmCrPaQ";
const botUsername = "tabasom_ReactionBOT";
const Reactions = splitEmojis("👍❤🔥🥰👏🎉🤩🙏👌🕊😍🐳❤‍🔥💯⚡🏆");
const RestrictedChats = getChatIds("");
const RandomLevel = parseInt(process.env.RANDOM_LEVEL || '0', 10);

const botApi = new TelegramBotAPI(botToken);

app.post('/', async (req, res) => {
    const data = req.body;
    try {
        await onUpdate(data, botApi, Reactions, RestrictedChats, botUsername, RandomLevel);
        res.status(200).send('Ok');
    } catch (error) {
        console.info('Error in onUpdate:', error);
        res.status(200).send('Ok');
    }
});

app.get('/', (req, res) => {
    res.send(htmlContent);
});

async function onUpdate(data, botApi, Reactions, RestrictedChats, botUsername, RandomLevel) {
    let chatId, message_id, text;

    if (data.message || data.channel_post) {
        const content = data.message || data.channel_post;
        chatId = content.chat.id;
        message_id = content.message_id;
        text = content.text;

        if (data.message && (text === '/start' || text === '/start@' + botUsername)) {
            await botApi.sendMessage(chatId, startMessage.replace('UserName', content.chat.type === "private" ? content.from.first_name : content.chat.title), [
                [
                    { "text": "➕ اضافه کردن به کانال ➕", "url": `https://t.me/${botUsername}?startchannel=botstart` },
                    { "text": "➕ اضافه کردن به گروه ➕", "url": `https://t.me/${botUsername}?startgroup=botstart` },
                ],
                [
                    { "text": "ورود به گروه شعر و کتاب", "url": "https://t.me/+I6_WffTbAdg1NjBk" },
                ]
            ]);
        } else if (data.message && text === '/reactions') {
            const reactions = Reactions.join(", ");
            await botApi.sendMessage(chatId, "✅ ری اکشن های فعال شده     : \n\n" + reactions);
        } else {
            // Calculate the threshold: higher RandomLevel, lower threshold
            let threshold = 1 - (RandomLevel / 10);
            if (!RestrictedChats.includes(chatId)) {
                // Check if chat is a group or supergroup to determine if reactions should be random
                if (["group", "supergroup"].includes(content.chat.type)) {
                    // Run Function Randomly - Accroding to the RANDOM_LEVEL
                    if (Math.random() <= threshold) {
                        await botApi.setMessageReaction(chatId, message_id, getRandomPositiveReaction(Reactions));
                    }
                } else {
                    // For non-group chats, set the reaction directly
                    await botApi.setMessageReaction(chatId, message_id, getRandomPositiveReaction(Reactions));
                }
            }
        }
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
