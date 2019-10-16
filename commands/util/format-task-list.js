const { getTaskTags } = require('../kanboard');

module.exports = function formatTaskList(tasks, showDueDate=false) {
    const taskReplies = Promise.all(tasks.map(async (t) => {
        const tags = Object.values(await getTaskTags(t.id));

        const dateStr = showDueDate ? ` ${new Date(t.date_due * 1000).toISOString().split('T')[0]}` : '';

        if (tags.length > 0) {
            return `- ${t.id} (${tags.join(', ')})` + dateStr + `: ${t.title}`;
        } else {
            return `- ${t.id}` + dateStr + `: ${t.title}`;
        }
    }));

    return taskReplies;
}
