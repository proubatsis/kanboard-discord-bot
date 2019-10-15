const { KANBOARD_COLUMN_MAPPING, getAllTasks, getTaskTags } = require('./kanboard');

module.exports = async function ls(match, msg) {
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
};
