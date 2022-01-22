import { SceneManager } from "../../../SceneManager";
import { InputAxis } from "../../InputAxis";
import { InputButton } from "../../InputButton";
import { InputDevice } from "../InputDevice";
import { TouchAxis } from "./TouchAxis";
import { TouchButton } from "./TouchButton";

/** @category Input */
export class Touch implements InputDevice {
    private _positions: InputAxis[];
    private _button: InputButton;
    private _fireListener: boolean;

    private _onTouchEvent: (e: TouchEvent) => void;

    public constructor() {
        this._button = new InputButton();
        this._positions = [];
        this._fireListener = false;

        const scene = SceneManager.getInstance()?.getCurrentScene()!;

        this._onTouchEvent = ((e: TouchEvent) => {
            e.preventDefault();

            this._positions.splice(0);

            for (let i = 0; i < e.touches.length; i++) {
                const item = e.touches[i];
                this._positions[i] = new InputAxis([
                    Math.round(item.clientX * window.devicePixelRatio * scene.cameraManager.renderScale),
                    Math.round(item.clientY * window.devicePixelRatio * scene.cameraManager.renderScale),
                ]);
            }

            this._button.down = !!e.touches.length;

            this._fireListener = true;
        }).bind(this);

        this.addListeners();
    }

    public getButton(btn: TouchButton): Readonly<InputButton> | undefined {
        if (btn === 0) return this._button;

        return;
    }

    public getAxis(ax: TouchAxis): Readonly<InputAxis> | undefined {
        return this._positions[ax];
    }

    public update(): void {
        this._button.update();
    }

    private addListeners(): void {
        window.addEventListener("touchstart", this._onTouchEvent);
        window.addEventListener("touchend", this._onTouchEvent);
        window.addEventListener("touchmove", this._onTouchEvent);
    }

    private removeListeners(): void {
        window.removeEventListener("touchstart", this._onTouchEvent);
        window.removeEventListener("touchend", this._onTouchEvent);
        window.removeEventListener("touchmove", this._onTouchEvent);
    }

    public dispose(): void {
        this.removeListeners();
    }
}
