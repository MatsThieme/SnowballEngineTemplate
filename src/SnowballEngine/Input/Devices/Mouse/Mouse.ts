import projectConfig from "Config";
import { SceneManager } from "SE";
import { InputAxis } from "../../InputAxis";
import { InputButton } from "../../InputButton";
import { InputDevice } from "../InputDevice";
import { MouseAxis } from "./MouseAxis";
import { MouseButton } from "./MouseButton";

/** @category Input */
export class Mouse implements InputDevice {
    /**
     *
     * Pointer position on canvas.
     *
     */
    private _position: InputAxis;
    private _prevPosition: InputAxis;
    private _buttons: InputButton[];
    private _fireListener: boolean;

    private _onMouseDown: (e: MouseEvent) => void;
    private _onMouseUp: (e: MouseEvent) => void;
    private _onMouseMove: (e: MouseEvent) => void;
    private _onContextMenu: (e: MouseEvent) => void;

    public constructor() {
        this._buttons = [];
        this._position = new InputAxis();
        this._prevPosition = new InputAxis();
        this._fireListener = false;

        this._onMouseMove = ((e: MouseEvent) => {
            this._prevPosition.values = this._position.values;
            this._position.values = [
                Math.round(
                    e.clientX *
                        window.devicePixelRatio *
                        SceneManager.getInstance()!.getCurrentScene()!.cameraManager.renderScale
                ),
                Math.round(
                    e.clientY *
                        window.devicePixelRatio *
                        SceneManager.getInstance()!.getCurrentScene()!.cameraManager.renderScale
                ),
            ];

            this._fireListener = true;
        }).bind(this);

        this._onMouseUp = ((e: MouseEvent) => {
            this._prevPosition.values = this._position.values;
            this._position.values = [
                Math.round(
                    e.clientX *
                        window.devicePixelRatio *
                        SceneManager.getInstance()!.getCurrentScene()!.cameraManager.renderScale
                ),
                Math.round(
                    e.clientY *
                        window.devicePixelRatio *
                        SceneManager.getInstance()!.getCurrentScene()!.cameraManager.renderScale
                ),
            ];

            if (!this._buttons[e.button]) this._buttons[e.button] = new InputButton();

            this._buttons[e.button].down = false;

            this._fireListener = true;
        }).bind(this);

        this._onMouseDown = ((e: MouseEvent) => {
            this._prevPosition.values = this._position.values;
            this._position.values = [
                Math.round(
                    e.clientX *
                        window.devicePixelRatio *
                        SceneManager.getInstance()!.getCurrentScene()!.cameraManager.renderScale
                ),
                Math.round(
                    e.clientY *
                        window.devicePixelRatio *
                        SceneManager.getInstance()!.getCurrentScene()!.cameraManager.renderScale
                ),
            ];

            if (!this._buttons[e.button]) this._buttons[e.button] = new InputButton();

            this._buttons[e.button].down = true;

            this._fireListener = true;
        }).bind(this);

        this._onContextMenu = ((e: MouseEvent) => {
            e.preventDefault();
        }).bind(this);

        this.addListeners();
    }

    public getButton(btn: MouseButton): Readonly<InputButton> | undefined {
        return this._buttons[btn];
    }

    public getAxis(ax: MouseAxis): Readonly<InputAxis> | undefined {
        if (ax === 0) return this._position;
        if (ax === 1) return new InputAxis([this._position.values[0]]);
        if (ax === 2) return new InputAxis([this._position.values[1]]);
        if (ax === 3) return new InputAxis(this._prevPosition.v2.sub(this._position.v2).values);

        return undefined;
    }

    public update(): void {
        this._buttons.forEach((b) => b.update());
    }

    private addListeners(): void {
        window.addEventListener("mousedown", this._onMouseDown);
        window.addEventListener("mouseup", this._onMouseUp);
        window.addEventListener("mousemove", this._onMouseMove);
        if (!projectConfig.settings.allowContextMenu)
            window.addEventListener("contextmenu", this._onContextMenu);
    }

    private removeListeners(): void {
        window.removeEventListener("mousedown", this._onMouseDown);
        window.removeEventListener("mouseup", this._onMouseUp);
        window.removeEventListener("mousemove", this._onMouseMove);
        window.removeEventListener("contextmenu", this._onContextMenu);
    }

    public dispose(): void {
        this.removeListeners();
    }
}
