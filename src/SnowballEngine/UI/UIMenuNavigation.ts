export class UIMenuNavigation {
    /**
     * 
     * UIMenuNavigation.navigationHistory stores the names of previously activated menus.
     * UIMenuNavigation.navigationHistory[0] is the last activated menu. 
     * 
     */
    public readonly navigationHistory: UIMenuName[];

    /**
     * 
     * Max length of UIMenuNavigation.navigationHistory.
     * 
     */
    public navigationHistoryMaxSize: number;


    public constructor() {
        this.navigationHistory = [];
        this.navigationHistoryMaxSize = 100;
    }

    public onEnableMenu(name: UIMenuName): void {
        this.navigationHistory.unshift(name);
        if (this.navigationHistory.length > this.navigationHistoryMaxSize) this.navigationHistory.splice(this.navigationHistoryMaxSize);
    }
}