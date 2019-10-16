const { KANBOARD_COLUMN_MAPPING, getAllTasks, getTaskTags } = require('./kanboard');
const formatTaskList = require('./util/format-task-list');

function filterTasksByColumn(tasks, columnId) {
    return tasks.filter(t => t.column_id === columnId);
}

module.exports = async function ls(match, msg) {
    const [_, columnName] = match;

    if (columnName) {
        // kan ls <column-name>
        const tasks = await getAllTasks();

        const columnId = KANBOARD_COLUMN_MAPPING[columnName];
        if (columnId === undefined) {
            msg.reply(`Cannot find column "${columnName}"`);
            return;
        }

        const tasksInColumn = filterTasksByColumn(tasks, columnId);
        const taskReplies = await formatTaskList(tasksInColumn);

        msg.reply(`Tasks in ${columnName}:\n\n${taskReplies.join('\n')}`);
        return;

    }
    else {
        // kan ls
        const tasks = await getAllTasks();

        const replies = await Promise.all(Object.keys(KANBOARD_COLUMN_MAPPING).map(async (columnName) => {
            const tasksInColumn = filterTasksByColumn(tasks, KANBOARD_COLUMN_MAPPING[columnName]);
            const taskReplies = await formatTaskList(tasksInColumn);
            return `Tasks in ${columnName}:\n\n${taskReplies.join('\n')}`;
        }));

        msg.reply(replies.join('\n========\n'));
    }
};
