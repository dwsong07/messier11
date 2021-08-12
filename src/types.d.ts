import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ApplicationCommandData,
    Collection,
    CommandInteraction,
} from "discord.js";

declare module "discord.js" {
    interface Client {
        commands: Collection<unknown, Command>;
    }
}

export interface Command {
    data: Partial<SlashCommandBuilder>;
    execute: (interaction: CommandInteraction) => void;
}

declare module "*.command.ts" {
    const command: Command;
    export = command;
}
