import { MessageSelectMenu, MessageSelectOptionData, Client } from "discord.js";
import Component from "./Component";

export default class SelectMenu extends Component {
    protected _component: MessageSelectMenu;

    constructor() {
        super();
        this._component = new MessageSelectMenu();

        return this;
    }

    addOptions(
        ...options: MessageSelectOptionData[] | MessageSelectOptionData[][]
    ): this {
        this._component.addOptions(...options);
        return this;
    }

    setMaxValues(maxValues: number): this {
        this._component.setMaxValues(maxValues);
        return this;
    }

    setMinValues(minValues: number): this {
        this._component.setMinValues(minValues);
        return this;
    }

    setPlaceholder(placeholder: string): this {
        this._component.setPlaceholder(placeholder);
        return this;
    }

    spliceOptions(index: number, deleteCount: number): this {
        this._component.spliceOptions(index, deleteCount);
        return this;
    }

    static init(client: Client): void {
        client.on("interactionCreate", async (interaction) => {
            if (!interaction.isSelectMenu()) return;

            const button = this.subscribedButtons.get(interaction.customId);
            if (!button) return;

            await button(interaction);
        });
    }
}
