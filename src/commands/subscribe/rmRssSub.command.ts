import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { Command } from "../../types";

export default {
    data: new SlashCommandBuilder()
        .setName("rm_rss_sub")
        .setDescription("RSS 구독을 삭제합니다.")
        .addIntegerOption((option) =>
            option.setName("id").setDescription("RSS 피드 id").setRequired(true)
        ),
    async execute(interaction) {
        try {
            const id = interaction.options.getInteger("id");

            const data = await interaction.client.db.all(
                "SELECT requester_id FROM rss_sub WHERE id=?",
                id
            );

            if (!data.length)
                return interaction.reply({
                    content: "그런 아이디 없는데요",
                    ephemeral: true,
                });

            if (data[0].requester_id !== interaction.user.id)
                return interaction.reply({
                    content: "구독한 사람만 삭제할 수 있습니다.",
                    ephemeral: true,
                });

            await interaction.client.db.run(
                "DELETE FROM rss_sub WHERE id=?",
                id
            );

            const embed = new MessageEmbed()
                .setTitle(":white_check_mark: RSS 구독을 삭제했습니다.")
                .setDescription(`id: ${id}`)
                .setFooter(
                    interaction.user.username,
                    interaction.user.displayAvatarURL()
                )
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            interaction.reply("에러 났어요!");
        }
    },
} as Command;
