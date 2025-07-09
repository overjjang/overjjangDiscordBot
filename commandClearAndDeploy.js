const {REST , Routes} = require('discord.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();


const deployCommands = () => {
    const token = process.env.TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildIds = process.env.GUILD_ID.split(" ").map(id => id.trim());

    const commands = [];
// Grab all the command folders from the commands directory you created earlier
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        // Grab all the command files from the commands directory you created earlier
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

// Construct and prepare an instance of the REST modules
    const rest = new REST().setToken(token);



// and deploy your commands!
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            for (const guildId of guildIds) {
                // reset commands
                await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
                    .then(() => console.log(`Successfully deleted all guild commands.(${guildId.slice(0,4)}...)`))
                    .catch(console.error);

                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    {body: commands},
                );
                console.log(`Successfully reloaded ${commands.length} application (/) commands in guild (${guildId.slice(0,4)}...).`);
            }
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
}

deployCommands();

module.exports = deployCommands;
