const request = require('request-promise-native');

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

module.exports = {
    KANBOARD_COLUMN_MAPPING,
    getAllTasks,
    getTaskTags,
    getTask,
    moveTask,
};
