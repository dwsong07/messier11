import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import axios from "axios";
import { Command } from "../../types";

export default {
    data: new SlashCommandBuilder()
        .setName("prog_jokes")
        .setDescription("프로그래밍 조크를 출력합니다."),
    async execute(interaction) {
        try {
            interaction.deferReply();

            const res = await axios.get(
                "https://official-joke-api.appspot.com/jokes/programming/random"
            );
            const json = res.data;

            const { setup, punchline } = json[0];

            const embed = new MessageEmbed()
                .setTitle(setup)
                .setDescription(`***${punchline}***\n\n(두둥탁)`)
                .setFooter(
                    "from `https://github.com/15Dkatz/official_joke_api`"
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.reply("에러 났어요!");
        }
    },
} as Command;
