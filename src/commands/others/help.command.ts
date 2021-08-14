import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ButtonInteraction,
    MessageActionRow,
    MessageEmbed,
    User,
} from "discord.js";
import Button from "../../components/Button";
import { Command } from "../../types";

// numString is something like "1/5", "3/5"
function makeHelpEmbed(
    commands: Partial<SlashCommandBuilder>[],
    currentPage: number,
    pageLength: number,
    user: User
) {
    return new MessageEmbed()
        .setTitle(`도움말 ${currentPage + 1}/${pageLength}`)
        .addFields(
            commands.map((command) => ({
                name: `\`${command.name ?? ""}\``,
                value: command.description ?? "",
            }))
        )
        .setTimestamp()
        .setFooter(user.username, user.displayAvatarURL());
}

export default {
    data: new SlashCommandBuilder().setName("help").setDescription("도움말"),
    async execute(interaction) {
        try {
            const commandDatas = interaction.client.commands.map(
                (command) => command.data
            );

            const lengthInOne = 5;
            const pageLength = Math.ceil(commandDatas.length / lengthInOne);
            let currentPage = 0;

            const commandsList: Partial<SlashCommandBuilder>[][] = [];
            for (let i = 0; i < pageLength; i++) {
                commandsList.push(
                    commandDatas.slice(i * 5, i * 5 + lengthInOne)
                );
            }

            const embed = makeHelpEmbed(
                commandsList[0],
                currentPage,
                pageLength,
                interaction.user
            );

            const makeButton = (label: string, customId: string) =>
                new Button()
                    .setCustomId(customId)
                    .setLabel(label)
                    .setStyle("PRIMARY");

            const prevButton = makeButton("🡄", "help_prevBtn");
            const nextButton = makeButton("🡆", "help_nextBtn");

            const row = new MessageActionRow().addComponents(
                prevButton.get(),
                nextButton.get()
            );

            interaction.reply({ embeds: [embed], components: [row] });

            const itIsNotForYou = (i: ButtonInteraction) => {
                if (i.user?.id !== interaction.user.id) {
                    i.reply({
                        content: "직접 /help 하세요",
                        ephemeral: true,
                    });
                    return true;
                }
            };

            prevButton.onClick((i) => {
                if (itIsNotForYou(i as ButtonInteraction)) return;

                currentPage =
                    currentPage === 0 ? pageLength - 1 : currentPage - 1;

                const embed = makeHelpEmbed(
                    commandsList[currentPage],
                    currentPage,
                    pageLength,
                    interaction.user
                );

                interaction.editReply({ embeds: [embed] });
                i.update({}); // For preventing "This interaction failed"
            });

            nextButton.onClick((i) => {
                if (itIsNotForYou(i as ButtonInteraction)) return;

                currentPage =
                    currentPage === pageLength - 1 ? 0 : currentPage + 1;

                const embed = makeHelpEmbed(
                    commandsList[currentPage],
                    currentPage,
                    pageLength,
                    interaction.user
                );

                interaction.editReply({ embeds: [embed] });
                i.update({});
            });

            // Cleanup
            setTimeout(() => {
                prevButton.removeEventListener();
                nextButton.removeEventListener();

                const row = new MessageActionRow().addComponents(
                    prevButton.setDisabled(true).get(),
                    nextButton.setDisabled(true).get()
                );

                interaction.editReply({ embeds: [embed], components: [row] });
            }, 60000);
        } catch (err) {
            console.error(err);
            interaction.reply("에러 났어요!");
        }
    },
} as Command;
