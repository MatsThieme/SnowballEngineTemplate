import { Input } from './Input';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { InputDevice } from './InputDevice';
import { InputEvent } from './InputEvent';
import { InputEventTarget } from './InputEventTarget';

export class InputMouse extends InputEventTarget {
    /**
     * 
     * Pointer position on canvas.
     * 
     */
    private _position: InputAxis;
    private buttons: InputButton[];
    private fireListener: boolean;

    public constructor() {
        super();

        this.buttons = [];
        this._position = new InputAxis();
        this.fireListener = false;

        this.addListeners();
    }
    private onMouseMove(e: MouseEvent): void {
        e.preventDefault();
        this._position.values = [Math.round(e.clientX * window.devicePixelRatio), Math.round(e.clientY * window.devicePixelRatio)];

        this.fireListener = true;
    }
    private onMouseUp(e: MouseEvent): void {
        e.preventDefault();
        this._position.values = [Math.round(e.clientX * window.devicePixelRatio), Math.round(e.clientY * window.devicePixelRatio)];

        this.buttons[e.button].down = false;

        this.fireListener = true;
    }
    private onMouseDown(e: MouseEvent): void {
        e.preventDefault();
        this._position.values = [Math.round(e.clientX * window.devicePixelRatio), Math.round(e.clientY * window.devicePixelRatio)];

        if (!this.buttons[e.button]) this.buttons[e.button] = new InputButton();

        this.buttons[e.button].down = true;

        this.fireListener = true;
    }
    private onContextMenu(e: MouseEvent): void {
        e.preventDefault()
    }
    public getButton(index: number): InputButton | undefined {
        if (index === undefined) return undefined;

        return this.buttons[index] || new InputButton();
    }
    public getAxis(index: number): InputAxis {
        return index === 0 ? this._position : new InputAxis();
    }
    public update(): void {
        this.buttons.forEach(b => b.update());

        if (!this.fireListener) return;

        for (const { cb, type } of this.listeners.values()) {
            const btn = Input.inputMappingButtons.mouse[type];
            const ax = Input.inputMappingAxes.mouse[type];

            const e: InputEvent = {
                type,
                device: InputDevice.Keyboard,
                axis: this.getAxis(ax!),
                button: this.getButton(btn!)
            }

            if (!e.axis && !e.button) continue;

            cb(e);
        }

        this.fireListener = false;
    }

    private addListeners(): void {
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        if (!project.settings.allowContextMenu) window.addEventListener('contextmenu', this.onContextMenu.bind(this));
    }

    private removeListeners(): void {
        window.removeEventListener('mousedown', this.onMouseDown.bind(this));
        window.removeEventListener('mouseup', this.onMouseUp.bind(this));
        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
        window.removeEventListener('contextmenu', this.onContextMenu.bind(this));
    }

    public destroy(): void {
        super.destroy();
        this.removeListeners();
    }
}