const { getTask, moveTask } = require('./kanboard');

module.exports = async function move(match, msg) {
    const [_, taskId, columnName] = match;
    const task = await getTask(taskId);
    const moveSuccessful = await moveTask(task, columnName);

    if (!moveSuccessful) {
        msg.reply(`Failed to move task ${taskId} to column ${columnName}`);
    }
    return;
};
