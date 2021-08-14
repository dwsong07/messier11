import { SlashCommandBuilder } from "@discordjs/builders";
import { channelMention } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { Command } from "../../types";

export default {
    data: new SlashCommandBuilder()
        .setName("ls_rss_sub")
        .setDescription("RSS 피드 목록을 출력합니다."),
    async execute(interaction) {
        try {
            const data = await interaction.client.db.all(
                "SELECT id, url, channel_id FROM rss_sub WHERE requester_id=?",
                interaction.user.id
            );

            const description = data
                .map(
                    (item) =>
                        `id: ${item.id}, ${channelMention(
                            item.channel_id
                        )}에서 ${item.url}`
                )
                .join("\n");

            const embed = new MessageEmbed()
                .setTitle(`${interaction.user.username}님의 RSS 피드`)
                .setDescription(description)
                .setTimestamp()
                .setFooter(
                    interaction.user.username,
                    interaction.user.displayAvatarURL()
                );

            interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            interaction.reply("에러 났어요!");
        }
    },
} as Command;
