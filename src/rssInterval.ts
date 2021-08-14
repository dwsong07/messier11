import { Client, MessageEmbed, TextChannel } from "discord.js";
import { Item } from "rss-parser";

interface stateTime {
    [key: string]: {
        prev: {
            [key: string]: any;
        } & Item;
        current: {
            [key: string]: any;
        } & Item;
    };
}

let state: stateTime = {};

export default function (client: Client) {
    setInterval(async () => {
        try {
            const { parser, db } = client;

            const data = await db.all("SELECT * FROM rss_sub");

            const urlArray = Array.from(new Set(data.map((_) => _.url))); // remove duplicates

            for (const url of urlArray) {
                const feed = await parser.parseURL(url);

                // The Latest Feed
                const latestFeed = feed.items.find(
                    (_) =>
                        new Date(_.pubDate ?? "").getTime() ===
                        Math.max(
                            ...feed.items.map((_) =>
                                new Date(_.pubDate ?? "").getTime()
                            )
                        )
                );

                state = {
                    ...state,
                    [url]: {
                        prev: state[url]?.current ?? latestFeed,
                        current: latestFeed,
                    },
                };
            }

            for (const row of data) {
                const channel = await client.channels.fetch(row.channel_id);

                if (
                    state[row.url]?.prev?.link === state[row.url]?.current?.link
                )
                    continue;

                const item = state[row.url].current;

                (channel as TextChannel).send(
                    `제목: ${item.title}\n${item.link}`
                );
            }
        } catch (err) {
            console.error(err);
        }
    }, /* 5 * 1000); // */ 30 * 60 * 1000); // 30 mins
}
