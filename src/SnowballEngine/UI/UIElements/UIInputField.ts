import { Asset } from '../../Assets/Asset.js';
import { Client } from '../../Client.js';
import { GameTime } from '../../GameTime.js';
import { clamp } from '../../Helpers.js';
import { Input } from '../../Input/Input.js';
import { UIElementType } from '../UIElementType.js';
import { UIFont } from '../UIFont.js';
import { UIMenu } from '../UIMenu.js';
import { UIElement } from './UIElement.js';

export abstract class UIInputField extends UIElement {
    public focused: boolean;
    protected domElement: HTMLInputElement;
    public abstract value: number | string;
    public max: number;
    public min: number;
    public constructor(menu: UIMenu, input: Input, font: Asset, type: UIElementType.NumberInputField | UIElementType.TextInputField) {
        super(menu, input, type, font);

        this.domElement = document.createElement('input');
        this.domElement.type = type === UIElementType.TextInputField ? 'text' : UIElementType.NumberInputField ? 'number' : '';
        document.body.appendChild(this.domElement);
        this.domElement.step = '0.1';

        this.min = 0;
        this.max = 999;
        this.focused = false;
    }
    public async update(gameTime: GameTime): Promise<void> {
        await super.update(gameTime);

        if (this.label === '') this.label = this.value.toString();

        if (this.input.getButton(InputType.Trigger).down && !this.down && this.focused) this.focused = false;
        else if (this.click) this.focused = true;

        if (this.focused) {
            this.domElement.focus();

            if (this.label !== this.domElement.value) {
                if (this.type === UIElementType.NumberInputField && typeof this.value === 'number') {
                    const x = parseFloat(this.domElement.value);

                    if (x) {
                        this.value = x;

                        this.value = clamp(this.min, this.max, this.value);

                        this.domElement.value = this.label = this.value.toString();
                    } else this.label = '0';
                } else if (this.type === UIElementType.TextInputField && typeof this.value === 'string') {
                    this.value = this.domElement.value;

                    if (this.value.length > this.max) this.value = this.value.substr(0, this.max);

                    this.domElement.value = this.label = this.value;
                }

                if (this.onInput) this.onInput(this);

                this.draw();
            }
        } else this.domElement.blur();
    }
    protected drawCb(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        canvas.width = this._aabb.size.x / 100 * (this.menu.aabb.size.x / 100 * Client.resolution.x);
        canvas.height = this._aabb.size.y / 100 * (this.menu.aabb.size.y / 100 * Client.resolution.y);
        context.save();

        if (this.background) context.drawImage(this.background, 0, 0, canvas.width, canvas.height);

        context.strokeStyle = context.fillStyle = context.shadowColor = this.color;

        context.lineWidth = Math.round(this.menu.aabb.size.magnitude / 50);
        if (this.stroke) context.strokeRect(context.lineWidth / 2, context.lineWidth / 2, canvas.width - context.lineWidth, canvas.height - context.lineWidth);

        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.font = UIFont.getCSSFontString(<string>this.font.data, this.fontSize);



        if (this.textShadow !== 0) {
            context.shadowBlur = context.lineWidth * 1.5 * this.textShadow;
            context.shadowOffsetX = context.lineWidth * this.textShadow;
            context.shadowOffsetY = -context.lineWidth * this.textShadow;
        }

        context.fillText(this.label, canvas.width / 2, canvas.height / 2);

        context.restore();
    }
}