const Discord = require('discord.js');
const logger = require('pino')();
const request = require('request-promise-native');

require('dotenv').config();

const KANBOARD_USERNAME = 'jsonrpc';
const KANBOARD_PASSWORD = process.env.KANBOARD_API_TOKEN;
const KANBOARD_API_URL = process.env.KANBOARD_API_URL;
const KANBOARD_PROJECT_ID = parseInt(process.env.KANBOARD_PROJECT_ID);
const KANBOARD_COLUMN_MAPPING_STR = process.env.KANBOARD_COLUMNS;

const KANBOARD_COLUMN_MAPPING = KANBOARD_COLUMN_MAPPING_STR
    .split(',')
    .map((s) => {
        const [name, id] = s.split(':');
        return { name, id };
    })
    .reduce((acc, curr) => ({ ...acc, [curr.name]: parseInt(curr.id) }), {});

const client = new Discord.Client();
const CMD_HELP = /^kan\s+help$/;
const CMD_LS = /^kan\s+ls\s+(.+?)$/;
const CMD_MOVE = /^kan\s+move\s+(\d+?)\s+(.+?)$/;

async function kanRequest(body) {
    const response = await request({
        method: 'POST',
        uri: KANBOARD_API_URL,
        body,
        auth: {
            username: KANBOARD_USERNAME,
            password: KANBOARD_PASSWORD,
        },
        json: true,
    });

    return response.result;
}

function getAllTasks() {
    const getAllTasksRequest = {
        jsonrpc: '2.0',
        method: 'getAllTasks',
        id: 3,
        params: {
            project_id: KANBOARD_PROJECT_ID,
            status_id: 1, // only get active tasks
        },
    };

    return kanRequest(getAllTasksRequest);
}

function getTaskTags(taskId) {
    const getTaskTagsRequest = {
        jsonrpc: '2.0',
        method: 'getTaskTags',
        id: 4,
        params: [taskId],
    };

    return kanRequest(getTaskTagsRequest);
}

function getTask(taskId) {
    const getTaskRequest = {
        jsonrpc: '2.0',
        method: 'getTask',
        id: 1,
        params: {
            task_id: taskId,
        },
    };

    return kanRequest(getTaskRequest);
}

function moveTask(task, columnName) {
    const columnId = KANBOARD_COLUMN_MAPPING[columnName];
    if (columnId === undefined) {
        throw new Error(`Cannot map ${columnName} to a column id`);
    }

    const moveTaskRequest = 
    {
        jsonrpc: '2.0',
        method: 'moveTaskPosition',
        id: 2,
        params: {
            project_id: KANBOARD_PROJECT_ID,
            task_id: task.id,
            column_id: columnId,
            position: 1,
            swimlane_id: task.swimlane_id,
        }
    };

    return kanRequest(moveTaskRequest);
}

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
});

client.on('message', async (msg) => {
    const command = msg.content.toLowerCase().trim();
    
    // kan help
    let match = command.match(CMD_HELP);
    if (match) {
        let reply = 'kan <command> <options>\n';
        reply += 'Commands:\n\n';

        const columnNames = Object.keys(KANBOARD_COLUMN_MAPPING).join(', ');

        reply += '    ls <column-name>\n';
        reply += '        List all tasks in a column\n';
        reply += `        Columns: ${columnNames}\n\n`;

        reply += '    move <task-id> <column-name>\n';
        reply += '        Move a task to another column\n';
        reply += `        Columns: ${columnNames}\n\n`;

        msg.reply(reply);
        return;
    }

    // kan ls <column-name>
    match = command.match(CMD_LS);
    if (match) {
        const [_, columnName] = match;
        const tasks = await getAllTasks();

        const columnId = KANBOARD_COLUMN_MAPPING[columnName];
        if (columnId === undefined) {
            msg.reply(`Cannot find column "${columnName}"`);
            return;
        }

        const tasksInColumn = tasks.filter(t => t.column_id === columnId);
        
        const taskReplies = await Promise.all(tasksInColumn.map(async (t) => {
            const tags = Object.values(await getTaskTags(t.id));

            if (tags.length > 0) {
                return `- ${t.id} (${tags.join(', ')}): ${t.title}`;
            } else {
                return `- ${t.id}: ${t.title}`;
            }
        }));

        msg.reply(`Tasks in ${columnName}:\n\n${taskReplies.join('\n')}`);
        return;
    }

    // kan move <task-id> <column-name>
    match = command.match(CMD_MOVE);
    if (match) {
        const [_, taskId, columnName] = match;
        const task = await getTask(taskId);
        const moveSuccessful = await moveTask(task, columnName);

        if (!moveSuccessful) {
            msg.reply(`Failed to move task ${taskId} to column ${columnName}`);
        }
        return;
    }

});

client.login(process.env.DISCORD_TOKEN);
