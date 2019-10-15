const { KANBOARD_COLUMN_MAPPING, getAllTasks, getTaskTags } = require('./kanboard');

function createTaskReplies(tasks) {
    const taskReplies = Promise.all(tasks.map(async (t) => {
        const tags = Object.values(await getTaskTags(t.id));

        if (tags.length > 0) {
            return `- ${t.id} (${tags.join(', ')}): ${t.title}`;
        } else {
            return `- ${t.id}: ${t.title}`;
        }
    }));

    return taskReplies;
}

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
        const taskReplies = await createTaskReplies(tasksInColumn);

        msg.reply(`Tasks in ${columnName}:\n\n${taskReplies.join('\n')}`);
        return;

    }
    else {
        // kan ls
        const tasks = await getAllTasks();

        const replies = await Promise.all(Object.keys(KANBOARD_COLUMN_MAPPING).map(async (columnName) => {
            const tasksInColumn = filterTasksByColumn(tasks, KANBOARD_COLUMN_MAPPING[columnName]);
            const taskReplies = await createTaskReplies(tasksInColumn);
            return `Tasks in ${columnName}:\n\n${taskReplies.join('\n')}`;
        }));

        msg.reply(replies.join('\n========\n'));
    }
};
