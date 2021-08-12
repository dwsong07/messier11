import { Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { statSync, readdirSync } from "fs";
import path from "path";

import { Command } from "../types";

const commands = new Collection<string, Command>();

// get all the files under directory recursively
const getFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
    const files: string[] = readdirSync(dirPath);

    files.forEach(function (file) {
        if (statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
};

const commandFiles =
    getFiles(path.resolve(__dirname))?.filter((file) =>
        file.match(/\.command\.(ts|js)$/)
    ) || [];

for (const file of commandFiles) {
    const command: Command = require(file).default; // due to export default thing

    commands.set(command.data.name ?? "", command);
}

export default commands;
