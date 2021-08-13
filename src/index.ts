import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import commands from "./commands";
import { token } from "../config.json";
import Button from "./components/Button";

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

console.log(process.env.NODE_ENV);

client.once("ready", async () => {
    console.log("The bot is ready!");

    client.commands = commands;
    await registerSlashCommands();

    Button.init(client);
});

async function registerSlashCommands() {
    try {
        console.log("Register slash commands");

        const rest = new REST({ version: "9" }).setToken(token);
        const clientId = client.application?.id ?? "";

        const commandDatas = commands.map((command) => command.data);

        if (process.env.NODE_ENV === "production") {
            await rest.put(Routes.applicationCommands(clientId), {
                body: commandDatas,
            });
        } else {
            for (const guild of client.guilds.cache) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guild[0]),
                    { body: commandDatas }
                );
            }
        }
    } catch (err) {
        console.error(err);
    }
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    try {
        if (!client.commands.has(interaction.commandName)) return;

        await client.commands
            .get(interaction.commandName)
            ?.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply("에러 났어요!");
    }
});

client.login(token);
