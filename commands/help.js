const { KANBOARD_COLUMN_MAPPING } = require('./kanboard');

module.exports = async function help(match, msg) {
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
};
