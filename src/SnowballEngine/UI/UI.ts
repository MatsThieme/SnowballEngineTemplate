import { Container } from '@pixi/display';
import { Destroy, Destroyable } from 'GameObject/Destroy';
import { Debug } from 'SnowballEngine/Debug';
import { UIMenu } from 'UI/UIMenu';
import { UIMenuNavigation } from 'UI/UIMenuNavigation';

/** @category UI */
export class UI implements Destroyable {
    public readonly menus: Partial<Record<UIMenuName, UIMenu>>;
    public readonly container: Container;
    public readonly navigationHistory: UIMenuNavigation;

    /**
     * 
     * The font that menus should use if no other font is set for the particular menu. When changed, the font of existing UI elements is not updated.
     * 
     */
    public font: UIFont;

    public constructor() {
        this.menus = {};
        this.container = new Container();
        this.navigationHistory = new UIMenuNavigation();

        this.font = 'Default-Normal';
    }

    /**
     * 
     * Add a new menu to the ui.
     * 
     */
    public async addMenu(name: UIMenuName, ...initializer: ((menu: UIMenu) => void | Promise<void>)[]): Promise<UIMenu> {
        if (this.menus[name]) {
            throw new Error(`Menu with name ${name} already exists`);
        }

        const menu = new UIMenu(name);

        this.container.addChild(menu.container);
        this.container.name = 'UI';

        this.menus[name] = menu;

        if (initializer) {
            for (const i of initializer) {
                await i(menu);
            }
        }

        return menu;
    }

    /**
     * 
     * Remove an existing menu.
     * 
     */
    public removeMenu(name: UIMenuName): void {
        const menu = this.menu(name);

        if (menu) {
            this.container.removeChild(menu.container);
            Destroy(menu);
            delete this.menus[name];
        } else {
            Debug.warn(`No Menu identified by ${name}`);
        }
    }

    /**
     * 
     * Return menu of specified name if present.
     * 
     */
    public menu(name: UIMenuName): UIMenu | undefined {
        return this.menus[name];
    }

    /**
     * 
     * Draw this.menus to canvas.
     *
     */
    public async update(): Promise<void> {
        await Promise.all(Object.values(this.menus).map(m => m.update()));
    }

    public onEnableMenu(name: UIMenuName): void {
        this.navigationHistory.onEnableMenu(name);
    }

    public onDisableMenu(name: UIMenuName): void {
        this.navigationHistory.currentIndex -= 1;
    }

    public prepareDestroy(): void {
        for (const menu of Object.values(this.menus)) {
            Destroy(menu);
        }
    }

    public destroy(): void {
        this.container.destroy();
    }
}