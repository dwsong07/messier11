import { SlashCommandBuilder } from "@discordjs/builders";
import { getBorderCharacters, table } from "table";
import {
    CommandInteraction,
    Interaction,
    MessageActionRow,
    MessageEmbed,
    SelectMenuInteraction,
} from "discord.js";
import SelectMenu from "../../components/SelectMenu";
import { Command } from "../../types";

export default {
    data: new SlashCommandBuilder()
        .setName("comcigan")
        .setDescription("컴시간 알리미에서 시간표를 불러옵니다.")
        .addStringOption((option) =>
            option
                .setName("학교이름")
                .setDescription("학교 이름")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option.setName("학년").setDescription("학년").setRequired(true)
        )
        .addIntegerOption((option) =>
            option.setName("반").setDescription("반").setRequired(true)
        ),
    async execute(interaction) {
        try {
            const schoolName = interaction.options.getString("학교이름");
            const timetable = interaction.client.timetable;

            const schoolSearch = await timetable.search(schoolName);

            if (schoolSearch.length > 1) {
                const embed = new MessageEmbed()
                    .setTitle("컴시간 알리미 학교 검색 결과")
                    .setFooter(
                        interaction.user.username,
                        interaction.user.displayAvatarURL()
                    )
                    .setTimestamp();

                const selectMenu = new SelectMenu()
                    .setCustomId("comcigan_menu")
                    .setPlaceholder("학교를 선택해주세요.")
                    .addOptions(
                        schoolSearch.map((item: any, index: number) => ({
                            label: `${item.region} ${item.name}`,
                            value: index.toString(),
                        }))
                    );

                const row = new MessageActionRow().addComponents(
                    selectMenu.get()
                );

                interaction.reply({
                    embeds: [embed],
                    components: [row],
                });

                selectMenu.onClick(async (i) => {
                    const selected = (i as SelectMenuInteraction).values[0];

                    await showTimeTable(
                        Number(selected),
                        i as SelectMenuInteraction
                    );
                    cleanUp();
                });

                const cleanUp = () => {
                    const row = new MessageActionRow().addComponents(
                        selectMenu.setDisabled(true).get()
                    );

                    interaction.editReply({
                        components: [row],
                    });
                };

                setTimeout(cleanUp, 20000);
            } else if (schoolSearch.length === 1) {
                await showTimeTable(0, interaction);
            } else {
                interaction.reply("그런 학교 없대요");
            }

            async function showTimeTable(
                index: number,
                i: CommandInteraction | SelectMenuInteraction
            ) {
                await timetable.setSchool(schoolSearch[index].code);

                const grade = interaction.options.getInteger("학년") ?? 0;
                const classNum = interaction.options.getInteger("반") ?? 0;

                const parsedTimetable = await timetable.getTimetable();
                const parsedClassTime = await timetable.getClassTime();

                const classTimeTable = parsedTimetable?.[grade]?.[classNum];
                if (!classTimeTable) {
                    return i.reply("학년/반을 잘못 입력하신 것 같아요..");
                }

                const tableArray: string[][] = [];

                tableArray[0] = ["", "월", "화", "수", "목", "금"];

                for (let i = 0; i < parsedClassTime.length; i++) {
                    tableArray.push([]);
                    tableArray[i + 1].push(parsedClassTime[i] ?? "");

                    for (const j in classTimeTable) {
                        const a = classTimeTable[j][i];
                        tableArray[i + 1].push(
                            a ? `${a.subject} ${a.teacher}` : ""
                        );
                    }
                }

                const tableString = table(tableArray, {
                    drawVerticalLine: (line, column) =>
                        line === 0 || line === tableArray[0].length,
                    columnDefault: {
                        alignment: "center",
                    },
                    border: getBorderCharacters("void"),
                });
                i.reply("```\n" + tableString + "\n```");
            }
        } catch (err) {
            console.error(err);
            interaction.reply("에러 났어요!");
        }
    },
} as Command;
