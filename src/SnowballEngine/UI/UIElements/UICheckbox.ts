import { Asset } from '../../Assets/Asset';
import { Client } from '../../Client';
import { GameTime } from '../../GameTime';
import { Input } from '../../Input/Input';
import { AABB } from '../../Physics/AABB';
import { Vector2 } from '../../Vector2';
import { UIElementType } from '../UIElementType';
import { UIFont } from '../UIFont';
import { UIMenu } from '../UIMenu';
import { UIElement } from './UIElement';

export class UICheckbox extends UIElement {
    private _checked: boolean;
    public constructor(menu: UIMenu, input: Input, font: Asset) {
        super(menu, input, UIElementType.Checkbox, font);

        this._checked = false;
    }

    /**
     * 
     * Checkbox checked?
     * 
     */
    public get checked(): boolean {
        return this._checked;
    }
    public set checked(val: boolean) {
        this._checked = val;
        this.draw();
    }

    /**
     * 
     * Update checked property.
     * 
     */
    public async update(): Promise<void> {
        await super.update();

        if (this.click) {
            this.checked = !this._checked;

            if (this.onInput) {
                this.onInput(this);
                this.draw();
            }
        }
    }
    protected drawCb(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        const labelSize = UIFont.measureText(this.label, UIFont.getCSSFontString(<string>this.font.data, this.fontSize));

        canvas.height = Math.min(this._aabb.size.x / 100 * (this.menu.aabb.size.x / 100 * Client.resolution.x), this._aabb.size.y / 100 * (this.menu.aabb.size.y / 100 * Client.resolution.y));
        canvas.width = canvas.height * 1.2 + labelSize.x / 100 * (this.menu.aabb.size.x / 100 * Client.resolution.x);

        const x = canvas.width / (this.menu.aabb.size.x / 100 * Client.resolution.x) * 100;
        const y = canvas.height / (this.menu.aabb.size.y / 100 * Client.resolution.y) * 100;

        (<any>this)._aabb = new AABB(new Vector2(x, y), this._aabb.position);

        context.save();

        if (this.background) context.drawImage(this.background, 0, 0, canvas.height, canvas.width);

        context.strokeStyle = context.fillStyle = context.shadowColor = this.color;

        context.lineWidth = Math.round(this.menu.aabb.size.magnitude / 50);
        if (this.stroke) context.strokeRect(context.lineWidth / 2, context.lineWidth / 2, canvas.height - context.lineWidth, canvas.height - context.lineWidth);

        // checkmark
        if (this._checked) {
            context.beginPath();
            context.moveTo(0.12 * canvas.height, 0.50 * canvas.height);
            context.lineTo(0.38 * canvas.height, 0.75 * canvas.height);
            context.lineTo(0.88 * canvas.height, 0.25 * canvas.height);
            context.stroke();
        }


        context.textAlign = 'right';
        context.textBaseline = 'middle';

        context.font = UIFont.getCSSFontString(<string>this.font.data, this.fontSize);

        if (this.textShadow > 0) {
            context.shadowBlur = context.lineWidth * 1.5 * this.textShadow;
            context.shadowOffsetX = context.lineWidth * this.textShadow;
            context.shadowOffsetY = -context.lineWidth * this.textShadow;
        }

        context.fillText(this.label, canvas.width, canvas.height / 2);

        context.restore();
    }
}