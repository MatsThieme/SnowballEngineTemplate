import { Asset } from '../Assets/Asset';
import { Canvas } from '../Canvas';
import { Client } from '../Client';
import { D } from '../Debug';
import { AlignH, AlignV } from '../GameObject/Align';
import { GameTime } from '../GameTime';
import { Input } from '../Input/Input';
import { AABB } from '../Physics/AABB';
import { Scene } from '../Scene';
import { Vector2 } from '../Vector2';
import { UI } from './UI';
import { UIElement } from './UIElements/UIElement';
import { UIFrame } from './UIFrame';

export class UIMenu {
    /**
     * 
     * if true the menu is visible and responsive to user interaction.
     * 
     */
    public active: boolean;

    /**
     * 
     * if true and this.active the scene will be paused.
     * 
     */
    public pauseScene: boolean;

    /**
     *
     * Set priority in drawing queue.
     * 
     */
    public drawPriority: number;
    private readonly uiElements: Map<number, UIElement>;
    private _aabb: AABB;
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    public background?: Asset;
    private frame: UIFrame;

    public localAlignH: AlignH;
    public localAlignV: AlignV;
    public alignH: AlignH;
    public alignV: AlignV;

    private redraw: boolean;

    public readonly scene: Scene;
    public readonly ui: UI;
    public constructor(input: Input, scene: Scene) {
        this.active = false;
        this.pauseScene = true;
        this.drawPriority = 0;
        this.uiElements = new Map();
        this._aabb = new AABB(new Vector2(100, 100), new Vector2());
        this.scene = scene;
        this.ui = scene.ui;

        this.localAlignH = AlignH.Left;
        this.localAlignV = AlignV.Top;
        this.alignH = AlignH.Left;
        this.alignV = AlignV.Top;

        this.canvas = Canvas(Client.resolution.x, Client.resolution.y);
        this.context = this.canvas.getContext('2d')!;

        this.frame = new UIFrame(new AABB(this._aabb.size.clone.scale(new Vector2(Client.resolution.x, Client.resolution.y)).scale(0.01), this._aabb.position), this.canvas);

        Client.OnResize(() => this.redraw = true);

        this.redraw = true;
    }

    /**
     * 
     * Add a UIElement to this. The newly created UIElement can be adjusted within the callback.
     * 
     */
    public addUIElement<T extends UIElement>(type: Constructor<T>, ...cb: ((uiElement: T, scene: Scene) => any)[]): T {
        const e = new type(this, Input, this.ui.font);
        this.uiElements.set(e.id, e);
        if (cb) cb.forEach(cb => cb(e, this.scene));
        e.draw();
        this.redraw = true;
        return e;
    }

    /**
     * 
     * Removes the UIElement with the given id if present.
     * 
     */
    public removeUIElement(id: number): void {
        this.uiElements.delete(id);
        this.redraw = true;
    }

    /**
     *
     * Returns the current UIFrame.
     * 
     */
    public get currentFrame(): UIFrame {
        return this.frame;
    }

    /**
     * 
     * Adjusts canvas size to AABB and draws UIElements to it.
     * 
     */
    public async update(): Promise<void> {
        await Promise.all([...this.uiElements.values()].map(e => e.update()));

        if (this.redraw && this.active) {
            this.canvas.width = ~~(this.aabb.size.x / 100 * Client.resolution.x);
            this.canvas.height = ~~(this.aabb.size.y / 100 * Client.resolution.y);

            if (this.background) this.context.drawImage(<CanvasImageSource>this.background.data, 0, 0, this.canvas.width, this.canvas.height);
            else this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (const uiElement of this.uiElements.values()) {
                const { sprite, aabb } = uiElement.currentFrame;
                this.context.drawImage(sprite, Math.round(aabb.position.x / 100 * (this.aabb.size.x / 100 * Client.resolution.x)), Math.round(aabb.position.y / 100 * (this.aabb.size.y / 100 * Client.resolution.y)), Math.round(aabb.size.x / 100 * (this.aabb.size.x / 100 * Client.resolution.x)), Math.round(aabb.size.y / 100 * (this.aabb.size.y / 100 * Client.resolution.y)));
            }

            this.frame = new UIFrame(new AABB(this._aabb.size.clone.scale(Client.resolution).scale(0.01), this._aabb.position), this.canvas);

            this.redraw = false;
        }
    }
    public get aabb(): AABB {
        const localAlign = new Vector2(this.localAlignH === AlignH.Left ? 0 : this.localAlignH === AlignH.Center ? - this._aabb.size.x / 2 : - this._aabb.size.x, this.localAlignV === AlignV.Top ? 0 : this.localAlignV === AlignV.Center ? - this._aabb.size.y / 2 : - this._aabb.size.y);
        const globalAlign = new Vector2(this.alignH === AlignH.Left ? 0 : this.alignH === AlignH.Center ? 50 : 100, this.alignV === AlignV.Top ? 0 : this.alignV === AlignV.Center ? 50 : 100);

        return new AABB(this._aabb.size, this._aabb.position.clone.add(globalAlign).add(localAlign));
    }
    public set aabb(val: AABB) {
        this.redraw = true;
        this._aabb = val;
    }
}