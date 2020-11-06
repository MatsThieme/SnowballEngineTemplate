import { Vector2 } from '../Vector2.js';
import { InputAxis } from './InputAxis.js';
import { InputButton } from './InputButton.js';

export class InputMouse {
    /**
     * 
     * Pointer position on canvas.
     * 
     */
    private _position: Vector2;
    private buttons: InputButton[];

    private listeners?: Map<string, Map<InputType, (button: InputButton, axis: InputAxis) => any>>;
    public constructor(domElement: HTMLCanvasElement) {
        this.buttons = [];
        this._position = new Vector2();
        
        domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        if (!project.settings.allowContextMenu) domElement.addEventListener('contextmenu', e => e.preventDefault());
    }
    private onMouseMove(e: MouseEvent): void {
        e.preventDefault();
        this._position.set(e.clientX * window.devicePixelRatio, e.clientY * window.devicePixelRatio).round();
    }
    private onMouseUp(e: MouseEvent): void {
        e.preventDefault();
        this._position.set(e.clientX * window.devicePixelRatio, e.clientY * window.devicePixelRatio).round();

        this.buttons[e.button].down = false;
    }
    private onMouseDown(e: MouseEvent): void {
        e.preventDefault();
        this._position.set(e.clientX * window.devicePixelRatio, e.clientY * window.devicePixelRatio).round();

        if (!this.buttons[e.button]) this.buttons[e.button] = new InputButton();

        this.buttons[e.button].down = true;
    }
    public getButton(index: number): InputButton {
        return this.buttons[index] || new InputButton();
    }
    public getAxis(index: number): InputAxis {
        return index === 0 ? new InputAxis([this._position.x, this._position.y]) : new InputAxis();
    }
    public update(): void {
        this.buttons.forEach(b => b.update());
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