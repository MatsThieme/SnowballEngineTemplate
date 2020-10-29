export class InputButton {
    private _down: boolean;
    private isDown: boolean;
    private wasDown: boolean;
    /**
     * 
     * Used to store state information about a button.
     * 
     */
    public constructor() {
        this._down = false;
        this.isDown = false;
        this.wasDown = false;
    }
    public get down(): boolean {
        return this.isDown;
    }
    public set down(val: boolean) {
        this._down = val;
    }

    /**
     * 
     * Returns whether the button was down in the last frame.
     * 
     */
    public get clicked(): boolean {
        return this.isDown && this.wasDown;
    }

    /**
     * 
     * Returns whether the button is clicked in this frame.
     * 
     */
    public get click(): boolean {
        return this.isDown && !this.wasDown;
    }
    public update(): void {
        if (!this._down) this.isDown = this.wasDown = false;
        else if (this._down && !this.isDown) this.isDown = true;
        else if (this._down && this.isDown) this.wasDown = true;
    }
}