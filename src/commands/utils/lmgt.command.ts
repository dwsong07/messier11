import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../../types";

export default {
    data: new SlashCommandBuilder()
        .setName("lmgt")
        .setDescription("Let Me Google That For You 링크를 생성합니다.")
        .addStringOption((option) =>
            option.setName("검색어").setDescription("검색어").setRequired(true)
        ),
    async execute(interaction) {
        const keyword = interaction.options.getString("검색어") ?? "";

        await interaction.reply(
            `https://letmegooglethat.com/?q=${encodeURIComponent(keyword)}`
        );
    },
} as Command;
