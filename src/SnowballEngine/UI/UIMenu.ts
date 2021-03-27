import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { AssetType } from 'SnowballEngine/Assets/AssetType';
import { Destroyable } from 'SnowballEngine/GameObject/Destroy';
import { Vector2 } from 'SnowballEngine/Utilities/Vector2';
import { Asset } from '../Assets/Asset';
import { Scene } from '../Scene';
import { UIElement } from './UIElements/UIElement';

export class UIMenu implements Destroyable {
    public font?: UIFont;
    public readonly container: Container;
    public readonly name: UIMenuName;
    /**
     * 
     * if true and this.active the scene will be paused.
     * 
     */
    public pauseScene: boolean;

    public onEnable?: () => void;
    public onDisable?: () => void;

    /**
     * 
     * if true the menu is visible and responsive to user interaction.
     * 
     */
    private _active: boolean;
    private _background?: Asset;
    private _backgroundSprite?: Sprite;
    private readonly _uiElements: Map<number, UIElement>;

    public constructor(name: UIMenuName) {
        this.pauseScene = true;
        this.container = new Container();
        this.name = name;

        this._active = false;
        this._uiElements = new Map();
    }

    public get active(): boolean {
        return this._active;
    }
    public set active(val: boolean) {
        if (val && !this._active) {
            this.container.visible = true;
            Scene.currentScene.ui.onEnableMenu(this.name);
            if (this.onEnable) this.onEnable();
        } else if (!val && this._active) {
            this.container.visible = false;
            Scene.currentScene.ui.onDisableMenu(this.name);
            if (this.onDisable) this.onDisable();
        }

        this._active = val;
    }

    public get background(): Asset | undefined {
        return this._background;
    }
    public set background(val: Asset | undefined) {
        if (val?.type !== AssetType.Image) throw new Error('Asset.type !== AssetType.Image');

        const s = val.getPIXISprite();

        if (!s) throw new Error(`Can't create PIXI.Sprite from Asset`);


        if (this._backgroundSprite) this.container.removeChild(this._backgroundSprite);

        this.container.addChild(s);

        this._backgroundSprite = s;
        this._backgroundSprite.zIndex = -1;
        this._backgroundSprite.scale.set(100);
        this._background = val;

        this.container.sortChildren();
    }

    /**
     * 
     * The higher the value (compared to other menus), the later it will be rendered.
     * 
     */
    public get zIndex(): number {
        return this.container.zIndex;
    }
    public set zIndex(val: number) {
        this.container.zIndex = val;
        this.container.parent.sortChildren();
    }

    public get position(): Vector2 {
        return new Vector2().copy(this.container.position);
    }
    public set position(val: Vector2) {
        this.container.position.copyFrom(val);
    }

    /**
     * 
     * Add a UIElement to this. The newly created UIElement can be adjusted within the callback.
     * 
     */
    public addUIElement<T extends UIElement>(type: Constructor<T>, ...initializer: ((uiElement: T) => void)[]): T {
        const e = new type(this);

        this._uiElements.set(e.id, e);

        this.container.addChild(e.container);

        if (initializer) {
            for (const i of initializer) {
                i(e);
            }
        }

        return e;
    }

    /**
     * 
     * Removes the UIElement with the given id if present.
     * 
     */
    public removeUIElement(id: number): void {
        const el = this._uiElements.get(id);

        if (el) {
            this.container.removeChild(el.container);
            el.destroy();
            this._uiElements.delete(id);
        }
    }


    /**
     * 
     * Adjusts canvas size to AABB and draws UIElements to it.
     * 
     */
    public async update(): Promise<void> {
        await Promise.all([...this._uiElements.values()].map(e => e.update()));
    }

    public destroy(): void {
        for (const uiElement of this._uiElements.values()) {
            uiElement.destroy();
        }
    }
}