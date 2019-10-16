const { getAllTasks } = require('./kanboard');
const formatTaskList = require('./util/format-task-list');

module.exports = async function due(match, msg) {
    const [_, dueInStr] = match;

    // kan due <due-in-x-days>
    try {
        const dueIn = parseInt(dueInStr);

        if (dueIn < 0) {
            msg.reply('Please provide a non-negative value');
            return;
        }

        const tasks = await getAllTasks();

        const currentDate = new Date();
        const lastDate = new Date();
        lastDate.setDate(currentDate.getDate() + dueIn);

        const tasksDue = tasks.filter((t) => {
            const dueDate = new Date(t.date_due * 1000);
            return (dueDate >= currentDate) && (dueDate < lastDate);
        });

        msg.reply(await formatTaskList(tasksDue, true));
    }
    catch (e) {
        msg.reply(`${dueInStr} is not a valid number!`);
    }
};
