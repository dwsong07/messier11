import { channelMention, SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { Command } from "../../types";

export default {
    data: new SlashCommandBuilder()
        .setName("add_rss_sub")
        .setDescription("RSS 구독을 추가합니다.")
        .addStringOption((option) =>
            option
                .setName("rss_url")
                .setRequired(true)
                .setDescription("RSS 피드 주소")
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const member = interaction.member as GuildMember;
            if (interaction.channel?.type === "DM")
                return interaction.reply({
                    content: "DM 채널에서는 사용할 수 없습니다.",
                    ephemeral: true,
                });

            if (!member.permissions.has("ADMINISTRATOR"))
                return interaction.reply({
                    content: "이 서버의 관리자만 사용할 수 있습니다.",
                    ephemeral: true,
                });

            const channel = interaction.channel;
            const rssURL = interaction.options.getString("rss_url");

            const feed = await interaction.client.parser
                .parseURL(rssURL as string)
                .catch(() => {
                    interaction.reply("잘못된 RSS 주소를 입력하신 것 같아요");
                });

            if (!feed) return;

            const insertedRow = await interaction.client.db.run(
                "INSERT INTO rss_sub(url, channel_id, requester_id) VALUES(?, ?, ?)",
                rssURL,
                interaction.channelId,
                interaction.user.id
            );

            const embed = new MessageEmbed()
                .setTitle(":white_check_mark: RSS 피드를 구독했습니다.")
                .setDescription(
                    `${channelMention(interaction.channelId)}에 **${
                        feed.title
                    }**를 구독함. (id: ${insertedRow.lastID})`
                )
                .setTimestamp()
                .setFooter(
                    interaction.user.username,
                    interaction.user.displayAvatarURL()
                );

            interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            interaction.reply(err);
        }
    },
} as Command;
