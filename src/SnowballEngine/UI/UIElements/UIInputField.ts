import { UIElementType } from "UI/UIElementType";
import { UIMenu } from "UI/UIMenu";
import { UIText } from "./UIText";

/** @category UI */
export abstract class UIInputField<T extends number | string> extends UIText {
    public focused: boolean;
    public readonly domElement: HTMLInputElement;
    protected _prevValue!: T;

    /**
     *
     * Max number of characters. A change will come in effect as this.value changes.
     *
     */
    public length: number;

    public constructor(
        menu: UIMenu,
        name: string,
        type: UIElementType.NumberInputField | UIElementType.TextInputField
    ) {
        super(menu, name, type);

        this.domElement = document.createElement("input");
        this.domElement.type =
            type === UIElementType.TextInputField ? "text" : UIElementType.NumberInputField ? "number" : "";
        document.body.appendChild(this.domElement);
        this.domElement.step = "0.000001";

        this.domElement.addEventListener("blur", this.elOnBlur.bind(this));
        this.domElement.addEventListener("input", this.elOnInput.bind(this));

        this.length = 10;
        this.focused = false;
    }

    public get value(): T {
        return <T>(
            (this.type === UIElementType.TextInputField ? this.domElement.value : +this.domElement.value || 0)
        );
    }
    public set value(val: T) {
        this.domElement.value = (val + "").substr(0, this.length);
    }

    private elOnInput(e: Event): void {
        if (this.domElement.value.length > this.length) {
            this.domElement.value = <string>this._prevValue;
        }
    }

    private elOnBlur(e: Event): void {
        this.focused = false;
    }

    private focus(): void {
        this.domElement.focus();
        this.focused = true;
    }

    public override update(): void {
        if (!this.active) return;

        super.update();

        if (this.domElement.value != this._bitmapText.text) {
            this._bitmapText.text = this.domElement.value;

            if (this.onInput) this.onInput(this);
        }

        if (this.click) this.focus();
    }

    public override destroy(): void {
        this.domElement.remove();

        this.domElement.removeEventListener("blur", this.elOnBlur.bind(this));
        this.domElement.removeEventListener("input", this.elOnInput.bind(this));

        super.destroy();
    }
}
