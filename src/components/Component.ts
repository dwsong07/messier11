import {
    MessageButton,
    MessageSelectMenu,
    Collection,
    ButtonInteraction,
    SelectMenuInteraction,
} from "discord.js";

type EventListener = (
    interaction: ButtonInteraction | SelectMenuInteraction
) => Promise<void> | void;

export default class Component {
    protected _dateId: number;
    protected _component!: MessageButton | MessageSelectMenu;

    constructor() {
        this._dateId = new Date().getTime();

        return this;
    }

    setCustomId(customId: string): this {
        this._component.customId = customId + this._dateId;
        return this;
    }

    setDisabled(disabled: boolean): this {
        this._component.setDisabled(disabled);
        return this;
    }

    protected static subscribedButtons = new Collection<
        string,
        EventListener
    >();

    onClick(listener: EventListener): this {
        if (!this._component.customId) throw new Error("CustomId is null");

        const that = this.constructor as typeof Component;
        that.subscribedButtons.set(this._component.customId, listener);
        return this;
    }

    removeEventListener(): void {
        if (!this._component.customId) throw new Error("CustomId is null");

        const that = this.constructor as typeof Component;
        if (!that.subscribedButtons.has(this._component.customId))
            throw new Error("Listener doesn't exist");

        that.subscribedButtons.delete(this._component.customId);
    }

    get(): MessageButton | MessageSelectMenu {
        return this._component;
    }
}
