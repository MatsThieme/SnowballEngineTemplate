import { InputAxis } from './InputAxis.js';
import { InputButton } from './InputButton.js';
import { InputType } from './InputType.js';

export class InputKeyboard {
    private keys: Map<string, InputButton>;
    private listeners?: Map<string, Map<InputType, (button: InputButton, axis: InputAxis) => any>>;
    public constructor() {
        this.keys = new Map();

        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    private onKeyDown(e: KeyboardEvent): void {
        let btn = <InputButton>this.keys.get(e.code);
        if (!btn) btn = new InputButton();
        btn.down = true;
        this.keys.set(e.code, btn);
    }
    private onKeyUp(e: KeyboardEvent): void {
        let btn = <InputButton>this.keys.get(e.code);
        if (!btn) btn = new InputButton();
        btn.down = false;
        this.keys.set(e.code, btn);
    }
    public getButton(key: string): InputButton {
        if (!this.keys.get(key)) this.keys.set(key, new InputButton());
        return <InputButton>this.keys.get(key);
    }
    public getAxis(key: string): InputAxis {
        if (key === undefined) return new InputAxis();
        let match = <RegExpMatchArray>key.match(/^Axis\((\w*)\W*(\w*)\)$/);
        if (match.length === 3 && this.getButton(match[1]) && this.getButton(match[2])) return new InputAxis((this.getButton(match[1]).down ? -1 : 0) + (this.getButton(match[2]).down ? 1 : 0));
        else return new InputAxis();
    }
    public update() {
        [...this.keys.values()].forEach(b => b.update());
    }
    public addListener(cb: (button: InputButton, axis: InputAxis) => any, type: InputType = -1, id?: string) {
        if (!this.listeners) this.listeners = new Map();
        if (!this.listeners.get(id!)) this.listeners.set(id!, new Map());

        //this.listeners.get(id!)?.set(type!, cb);

    }
    public removeListener(id: string, type?: InputType) {
        this.listeners?.delete(id);
    }
}