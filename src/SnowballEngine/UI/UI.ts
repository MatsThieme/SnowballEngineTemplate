import { Asset } from '../Assets/Asset';
import { AssetType } from '../Assets/AssetType';
import { Canvas } from '../Canvas';
import { Client } from '../Client';
import { GameTime } from '../GameTime';
import { Input } from '../Input/Input';
import { AABB } from '../Physics/AABB';
import { Scene } from '../Scene';
import { Vector2 } from '../Vector2';
import { UIFrame } from './UIFrame';
import { UIMenu } from './UIMenu';

export class UI {
    public menus: Map<string, UIMenu>;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private scene: Scene;
    public navigationHistory: string[];
    private lastMenusState: boolean[];
    public navigationHistoryMaxSize: number;
    private _font!: Asset;
    public constructor(scene: Scene) {
        this.menus = new Map();
        this.canvas = Canvas(Client.resolution.x, Client.resolution.y);
        this.context = this.canvas.getContext('2d')!;
        this.scene = scene;
        this.navigationHistory = [];
        this.lastMenusState = [];
        this.navigationHistoryMaxSize = 10;
    }

    public get font(): Asset {
        return this._font || (this._font = new Asset('', AssetType.Font, 'sans-serif'));
    }

    public set font(val: Asset) {
        this._font = val;
    }

    /**
     * 
     * Add a new menu to the ui.
     * 
     */
    public async addMenu(name: string, ...cb: ((menu: UIMenu, scene: Scene) => void | Promise<void>)[]): Promise<UIMenu> {
        if (this.menus.has(name)) {
            const menu = this.menus.get(name)!;
            if (cb) cb.forEach(cb => cb(menu, this.scene));
            return menu;
        }

        const menu = new UIMenu(Input, this.scene);
        this.menus.set(name, menu);

        if (cb) {
            for (const c of cb) {
                await c(menu, this.scene);
            }
        }

        return menu;
    }

    /**
     * 
     * Return menu of specified name if present.
     * 
     */
    public menu(name: string): UIMenu | undefined {
        return this.menus.get(name);
    }

    /**
     * 
     * Draw this.menus to canvas.
     *
     */
    public async update(): Promise<void> {
        if (this.canvas.width !== Client.resolution.x) this.canvas.width = Client.resolution.x;
        if (this.canvas.height !== Client.resolution.y) this.canvas.height = Client.resolution.y;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);


        await Promise.all([...this.menus.values()].map(m => m.active ? m.update() : undefined));

        for (const menu of this.menus.values()) {
            if (menu.active) {
                if (menu.currentFrame.sprite.width > 0 && menu.currentFrame.sprite.height > 0)
                    this.context.drawImage(menu.currentFrame.sprite, Math.round(menu.aabb.position.x * Client.resolution.x / 100), Math.round(menu.aabb.position.y * Client.resolution.y / 100), Math.round(menu.aabb.size.x * Client.resolution.x / 100), Math.round(menu.aabb.size.y * Client.resolution.y / 100));
            }
        }

        let l;
        if (this.lastMenusState.length > 0) {
            l = [...this.menus.entries()];

            for (let i = 0; i < l.length; i++) {
                if (l[i][1].active && l[i][1].active !== this.lastMenusState[i] && (this.navigationHistory[0] || '') !== l[i][0]) {
                    this.navigationHistory.unshift(l[i][0]);
                }
            }

            if (this.navigationHistory.length > this.navigationHistoryMaxSize) this.navigationHistory.splice(this.navigationHistoryMaxSize);

            l = l.map(e => e[1].active);
        }

        this.lastMenusState = l || [...this.menus.values()].map(e => e.active);
    }

    /**
     * 
     * Returns the current frame of this.
     * 
     */
    public get currentFrame(): UIFrame {
        return new UIFrame(new AABB(new Vector2(Client.resolution.x, Client.resolution.y), new Vector2()), this.canvas);
    }

    /**
     *
     * Returns true if a menu has the pauseScene property set to true.
     * 
     */
    public get pauseScene(): boolean {
        return [...this.menus.values()].some(m => m.active && m.pauseScene);
    }
}