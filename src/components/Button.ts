import {
    InteractionCollector,
    MessageButton,
    MessageComponentInteraction,
    Interaction,
    Collection,
    InteractionCollectorOptions,
    ButtonInteraction,
    Client,
} from "discord.js";

type EventListener = (interaction: ButtonInteraction) => Promise<void> | void;

export default class Button extends MessageButton {
    private _collector?: InteractionCollector<MessageComponentInteraction>;
    private _dateId: number;

    constructor() {
        super();
        this._dateId = new Date().getTime();

        return this;
    }

    setCustomId(customId: string): this {
        this.customId = customId + this._dateId;
        return this;
    }

    private static subscribedButtons = new Collection<string, EventListener>();

    static init(client: Client): void {
        client.on("interactionCreate", async (integration) => {
            if (!integration.isButton()) return;

            const button = this.subscribedButtons.get(integration.customId);
            if (!button) return;

            await this.subscribedButtons.get(integration.customId)?.(
                integration
            );
            integration.update({}); // For preventing "This interaction failed"
        });
    }

    onClick(listener: EventListener): this {
        if (!this.customId) throw new Error("CustomId is null");

        Button.subscribedButtons.set(this.customId, listener);
        return this;
    }

    removeEventListener(): void {
        if (!this.customId) throw new Error("CustomId is null");
        if (!Button.subscribedButtons.has(this.customId))
            throw new Error("Listener doesn't exist");

        Button.subscribedButtons.delete(this.customId);
    }
}
