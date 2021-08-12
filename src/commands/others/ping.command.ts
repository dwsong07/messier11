import { SlashCommandBuilder } from "@discordjs/builders";
import { Message } from "discord.js";
import { Command } from "../../types";

export default {
    data: new SlashCommandBuilder().setName("ping").setDescription("핑퐁"),
    async execute(interaction) {
        const sent = (await interaction.reply({
            content: "Pinging..",
            fetchReply: true,
        })) as Message;
        sent.edit(
            `Pong! ${sent.createdTimestamp - interaction.createdTimestamp}ms`
        );
    },
} as Command;
