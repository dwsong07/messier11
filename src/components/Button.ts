import {
    MessageButton,
    Collection,
    ButtonInteraction,
    Client,
    MessageButtonStyleResolvable,
} from "discord.js";
import Component from "./Component";

export default class Button extends Component {
    protected _component: MessageButton;

    constructor() {
        super();
        this._component = new MessageButton();

        return this;
    }

    setEmoji(emoji: string): this {
        this._component.setEmoji(emoji);
        return this;
    }

    setLabel(content: string): this {
        this._component.setLabel(content);
        return this;
    }

    setStyle(style: MessageButtonStyleResolvable): this {
        this._component.setStyle(style);
        return this;
    }

    static init(client: Client): void {
        client.on("interactionCreate", async (interaction) => {
            if (!interaction.isButton()) return;

            const button = this.subscribedButtons.get(interaction.customId);
            if (!button) return;

            await button(interaction);
        });
    }
}
