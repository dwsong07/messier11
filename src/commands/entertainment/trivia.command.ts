import { SlashCommandBuilder } from "@discordjs/builders";
import {
    MessageActionRow,
    MessageEmbed,
    MessageSelectMenu,
    SelectMenuInteraction,
    User,
} from "discord.js";
import axios from "axios";
import he from "he";
import { Command } from "../../types";
import { shuffle } from "../util";

export default {
    data: new SlashCommandBuilder()
        .setName("trivia")
        .setDescription("트리비아 퀴즈")
        .addStringOption((option) =>
            option
                .setName("퀴즈_타입")
                .setDescription("OX 또는 객관식")
                .setRequired(true)
                .addChoice("아무거나", "any")
                .addChoice("OX", "ox")
                .addChoice("객관식", "obj")
        )
        .addStringOption((option) =>
            option
                .setName("난이도")
                .setDescription("쉬움/중간/어려움")
                .setRequired(true)
                .addChoice("아무거나", "any")
                .addChoice("쉬움", "easy")
                .addChoice("중간", "medium")
                .addChoice("어려움", "hard")
        ),
    async execute(interaction) {
        interaction.deferReply();

        const quizType = interaction.options.getString("퀴즈_타입");
        const difficulty = interaction.options.getString("난이도");

        const url = `https://opentdb.com/api.php?amount=1&${
            difficulty !== "any" ? `difficulty=${difficulty}` : ""
        }&${
            quizType === "ox"
                ? "type=boolean"
                : quizType === "obj"
                ? "type=multiple"
                : ""
        }`;

        const { data } = await axios.get(url);

        let { question, correct_answer, incorrect_answers, type } =
            data.results[0];

        question = he.decode(question);
        correct_answer = he.decode(correct_answer);
        incorrect_answers = incorrect_answers.map((item: string) =>
            he.decode(item)
        );

        const answers = shuffle([correct_answer, ...incorrect_answers]);

        const user = interaction.member?.user as User;
        const embed = new MessageEmbed()
            .setAuthor(user.tag, user.avatarURL() || "")
            .setTitle(`Q. ${question}`)
            .setDescription("20초 내로 아래 메뉴에서 선택해주세요")
            .setTimestamp();

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId("answer_menu")
                .setPlaceholder("답을 고르세요")
                .addOptions(
                    type === "multiple"
                        ? answers.map((answer, index) => ({
                              label: answer,
                              value: index.toString(),
                          }))
                        : [
                              {
                                  label: "O",
                                  value: "O",
                              },
                              {
                                  label: "X",
                                  value: "X",
                              },
                          ]
                )
        );

        interaction.editReply({ embeds: [embed], components: [row] });

        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: "SELECT_MENU",
            time: 20000,
        });

        const answer =
            type === "multiple"
                ? correct_answer
                : correct_answer === "True"
                ? "O"
                : "X";

        collector?.on("end", (collected) => {
            interaction.editReply({
                content: `:triangular_flag_on_post: 시간 끝! 정답은 ${answer}`,
                embeds: [embed],
                components: [],
            });
        });

        collector?.on("collect", (i) => {
            if (i.customId !== "answer_menu") return;
            const selected = (i as SelectMenuInteraction).values[0];

            if (type === "multiple") {
                if (answers[Number(selected)] === answer) {
                    i.reply({ content: "정답!", ephemeral: true });
                } else {
                    i.reply({
                        content: `땡! 정답은 ${answer}!`,
                        ephemeral: true,
                    });
                }
            } else {
                // if OX Quiz
                if (selected === answer) {
                    i.reply({ content: "정답!", ephemeral: true });
                } else {
                    i.reply({
                        content: `땡! 정답은 ${answer}!`,
                        ephemeral: true,
                    });
                }
            }
        });
    },
} as Command;
