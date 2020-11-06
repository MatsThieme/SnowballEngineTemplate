import { Assets } from '../Assets/Assets.js';
import { AssetType } from '../Assets/AssetType.js';
import { Scene } from '../Scene.js';
import { InputAxis } from './InputAxis.js';
import { InputButton } from './InputButton.js';
import { InputDevice } from './InputDevice.js';
import { InputGamepad } from './InputGamepad.js';
import { InputKeyboard } from './InputKeyboard.js';
import { InputMapping } from './InputMapping.js';
import { InputMouse } from './InputMouse.js';
import { InputTouch } from './InputTouch.js';
import './InputType.js';

export class Input {
    public readonly touch: InputTouch;
    public readonly mouse: InputMouse;
    public readonly keyboard: InputKeyboard;
    public readonly gamepad: InputGamepad;
    public readonly inputMappingButtons!: InputMapping;
    public readonly inputMappingAxes!: InputMapping;
    private readonly scene: Scene;
    public constructor(scene: Scene) {
        this.touch = new InputTouch(scene.domElement);
        this.mouse = new InputMouse(scene.domElement);
        this.keyboard = new InputKeyboard();
        this.gamepad = new InputGamepad();
        this.scene = scene;


        if (!Assets.get('InputMappingButtons.json'))
            Assets.load('InputMappingButtons.json', AssetType.JSON).then(m => (<any>this).inputMappingButtons = new InputMapping(m)).catch(undefined);

        if (!Assets.get('InputMappingAxes.json'))
            Assets.load('InputMappingAxes.json', AssetType.JSON).then(m => (<any>this).inputMappingAxes = new InputMapping(m)).catch(undefined);


        this.inputMappingButtons = new InputMapping(Assets.get('InputMappingButtons.json'));
        this.inputMappingAxes = new InputMapping(Assets.get('InputMappingAxes.json'));
    }

    /**
     * 
     * Returns a InputButton object mapped to the given inputtype.
     * 
     */
    public getButton(t: InputType): InputButton {
        if (['keyboard', 'mouse', 'gamepad', 'touch'].map(n => this.inputMappingButtons[n][t]).filter(x => x == undefined).length === 0) return new InputButton();

        const btns: InputButton[] = [this.keyboard.getButton(<string>this.inputMappingButtons.keyboard[t]), this.touch.getButton(<number>this.inputMappingButtons.touch[t]), this.mouse.getButton(<number>this.inputMappingButtons.mouse[t]), this.gamepad.getButton(<number>this.inputMappingButtons.gamepad[t])].filter(e => e && e.down != undefined).sort((a, b) => (b.down ? b.clicked ? 2 : 1 : 0) - (a.down ? a.clicked ? 2 : 1 : 0));

        return btns[0] || new InputButton();
    }

    /**
     * 
     * Returns the axis with the largest absolute value mapped to the given inputtype.
     * 
     */
    public getAxis(t: InputType): InputAxis {
        const axes: InputAxis[] = [this.keyboard.getAxis(<string>this.inputMappingAxes.keyboard[t]), this.touch.getAxis(<number>this.inputMappingAxes.touch[t]), this.mouse.getAxis(<number>this.inputMappingAxes.mouse[t]), this.gamepad.getAxis(<number>this.inputMappingAxes.gamepad[t])].filter(e => e && e.values.length).sort((a, b) => Math.abs(b.values.reduce((t, c) => t + c, 0)) - Math.abs(a.values.reduce((t, c) => t + c, 0)));

        for (const axis of axes) {
            if (axis.values.length && axis.values.reduce((t, c) => t + c, 0) !== 0) return axis;
        }

        return axes[0] || new InputAxis();
    }
    public update(): void {
        this.touch.update();
        this.mouse.update();
        this.keyboard.update();
        this.gamepad.update();
    }

    /**
     * 
     * @param id needed to remove the listener
     * @param devices 
     * 
     */
    public addListener(cb: (button: InputButton, axis: InputAxis) => any, type?: InputType, id?: string, devices?: InputDevice): void {
        if (!devices) {
            this.touch.addListener(cb, type, id);
            this.mouse.addListener(cb, type, id);
            this.keyboard.addListener(cb, type, id);
            this.gamepad.addListener(cb, type, id);

            return;
        }

        if (devices & InputDevice.Touch) this.touch.addListener(cb, type, id);
        if (devices & InputDevice.Mouse) this.mouse.addListener(cb, type, id);
        if (devices & InputDevice.Keyboard) this.keyboard.addListener(cb, type, id);
        if (devices & InputDevice.Gamepad) this.gamepad.addListener(cb, type, id);
    }

    public removeListener(id: string, device?: InputDevice) {

    }
}