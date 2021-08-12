import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../../types";
import { inviteURL } from "../../../config.json";

export default {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("봇 초대 링크"),
    async execute(interaction) {
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel("Invite Messier 11!")
                .setStyle("LINK")
                .setURL(inviteURL)
        );
        await interaction.reply({
            content: "Invite Messier 11",
            components: [row],
        });
    },
} as Command;
