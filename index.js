require('dotenv').config();

const Discord = require('discord.js');
const logger = require('pino')();

const CmdHelp = require('./commands/help');
const CmdLs = require('./commands/ls');
const CmdMove = require('./commands/move');
const CmdDue = require('./commands/due');


const client = new Discord.Client();
const CMD_HELP = /^kan\s+help$/;
const CMD_LS = /^kan\s+ls(?:\s+(.+?))?$/;
const CMD_MOVE = /^kan\s+move\s+(\d+?)\s+(.+?)$/;
const CMD_DUE = /^kan\s+due\s+(\d+?)$/;

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
});

client.on('message', async (msg) => {
    const cmd = msg.content.toLowerCase().trim();

    const commands = [
        { pattern: CMD_HELP, command: CmdHelp },
        { pattern: CMD_LS, command: CmdLs },
        { pattern: CMD_MOVE, command: CmdMove },
        { pattern: CMD_DUE, command: CmdDue },
    ];

    commands.forEach(({ pattern, command }) => {
        const match = cmd.match(pattern);
        if (match) {
            command(match, msg);
        }
    });
});

client.login(process.env.DISCORD_TOKEN);
