import { Asset } from '../../Assets/Asset';
import { Client } from '../../Client';
import { GameTime } from '../../GameTime';
import { Input } from '../../Input/Input';
import { UIElementType } from '../UIElementType';
import { UIFont } from '../UIFont';
import { UIMenu } from '../UIMenu';
import { UIElement } from './UIElement';

export class UIButton extends UIElement {
    public constructor(menu: UIMenu, input: Input, font: Asset) {
        super(menu, input, UIElementType.Button, font);
    }
    public async update(): Promise<void> {
        await super.update();

        if (this.click) {
            if (this.onInput) this.onInput(this);
            this.draw();
        }
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

        if (this.textShadow > 0) {
            context.shadowBlur = context.lineWidth * 1.5 * this.textShadow;
            context.shadowOffsetX = context.lineWidth * this.textShadow;
            context.shadowOffsetY = -context.lineWidth * this.textShadow;
        }

        context.fillText(this.label, canvas.width / 2, canvas.height / 2);

        context.restore();
    }
}