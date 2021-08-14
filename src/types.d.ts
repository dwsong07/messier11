import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ApplicationCommandData,
    Collection,
    CommandInteraction,
} from "discord.js";
import Parser from "rss-parser";

import { Database } from "sqlite";
import sqlite3 from "sqlite3";

declare module "discord.js" {
    interface Client {
        commands: Collection<unknown, Command>;
        db: Database<sqlite3.Database, sqlite3.Statement>;
        parser: Parser;
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
