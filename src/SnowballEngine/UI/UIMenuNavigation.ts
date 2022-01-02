/** @category UI */
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

    public currentIndex: number;

    public constructor() {
        this.navigationHistory = [];
        this.navigationHistoryMaxSize = 100;
        this.currentIndex = -1;
    }

    public onEnableMenu(name: UIMenuName): void {
        if (
            this.currentIndex !== -1 &&
            this.currentIndex + 1 < this.navigationHistory.length &&
            this.navigationHistory[this.currentIndex + 1] === name
        ) {
            this.currentIndex++;
        } else if (
            this.currentIndex !== -1 &&
            this.currentIndex - 1 > 0 &&
            this.navigationHistory[this.currentIndex - 1] === name
        ) {
            this.currentIndex--;
        } else {
            this.navigationHistory.unshift(name);
            if (this.navigationHistory.length > this.navigationHistoryMaxSize)
                this.navigationHistory.splice(this.navigationHistoryMaxSize);
        }
    }

    public get current(): UIMenuName | undefined {
        return this.navigationHistory[this.currentIndex];
    }

    public forward(): boolean {
        if (this.currentIndex + 1 >= this.navigationHistory.length) return false;

        this.currentIndex++;

        return true;
    }

    public back(): boolean {
        if (this.currentIndex - 1 < 0) return false;

        this.currentIndex--;

        return true;
    }
}
