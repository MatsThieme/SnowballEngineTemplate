import { Input } from './Input';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { InputDevice } from './InputDevice';
import { InputEvent } from './InputEvent';
import { InputEventTarget } from './InputEventTarget';

export class InputGamepad extends InputEventTarget {
    private buttons: InputButton[];
    public constructor() {
        super();

        this.buttons = new Array(16).fill(undefined).map(() => new InputButton());
    }
    private get gamepads(): Gamepad[] {
        return [...<Gamepad[]>navigator.getGamepads()].filter(g => g?.mapping === 'standard');
    }
    public getButton(b?: number): InputButton | undefined {
        if (b === undefined) return undefined;

        if (this.gamepads.findIndex(g => g.buttons[b].pressed) !== -1) this.buttons[b].down = true;
        else this.buttons[b].down = false;
        return this.buttons[b];
    }
    public getAxis(a?: number): InputAxis | undefined {
        if (a === undefined) return undefined;

        return this.gamepads.length && this.gamepads[0].axes.length > a ? new InputAxis(this.gamepads.map(g => g.axes[a]).sort((a, b) => a - b)[0]) : new InputAxis();
    }
    public update(): void {
        this.buttons.forEach(b => b.update());

        for (const { cb, type } of this.listeners.values()) {
            const btn = Input.inputMappingButtons.gamepad[type];
            const ax = Input.inputMappingAxes.gamepad[type];

            if (!btn && !ax) continue;

            const e: InputEvent = {
                button: this.getButton(btn!),
                axis: this.getAxis(ax!),
                device: InputDevice.Gamepad,
                type
            };

            if (!e.button?.down && !e.button?.click && !e.button?.clicked && !e.axis?.values[0] && !e.axis?.values[1]) continue;

            cb(e);
        }
    }

    public destroy(): void {
        super.destroy();
    }
}