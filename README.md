# Kanboard Discord Bot

Interact with kanboard using a discord bot.

## Commands

```
kan help
```

```
kan ls <column-name>
```

```
kan ls
```

```
kan move <task-id> <column-name>
```

```
kan due <due-in-x-days>
```

## Environment Variables

| Environment Variable | Description                                                                         | 
|---------------------|-------------------------------------------------------------------------------------| 
| DISCORD_TOKEN       | The discord bot token                                                               | 
| KANBOARD_PROJECT_ID | Project id for the board that should be manipulated                                 | 
| KANBOARD_COLUMNS    | Name to id mapping for columns in the project, example value `ready:5,wip:2,done:3` | 
| KANBOARD_API_TOKEN  | The kanboard API token for your instance                                            | 
| KAN_API_URL         | The jsonrpc url of your kanboard instance                                           | 
