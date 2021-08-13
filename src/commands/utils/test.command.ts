import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../../types";

export default {
    data: new SlashCommandBuilder().setName("test").setDescription("test"),
    async execute(interaction) {
        interaction.reply("ㅗ");
    },
} as Command;
