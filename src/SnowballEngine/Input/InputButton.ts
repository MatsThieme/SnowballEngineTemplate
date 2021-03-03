export class InputButton {
    private _down: boolean;
    private _isDown: boolean;
    private _wasDown: boolean;

    /**
     * 
     * Used to store state information about a button.
     * 
     */
    public constructor() {
        this._down = false;
        this._isDown = false;
        this._wasDown = false;
    }

    public get down(): boolean {
        return this._isDown;
    }
    public set down(val: boolean) {
        this._down = val;
    }

    /**
     * 
     * Returns whether the button is down and was down in the last frame.
     * 
     */
    public get clicked(): boolean {
        return this._isDown && this._wasDown;
    }

    /**
     * 
     * Returns whether the button is clicked in this frame.
     * 
     */
    public get click(): boolean {
        return this._isDown && !this._wasDown;
    }


    public get wasReleasedThisFrame(): boolean {
        return !this._isDown && this._wasDown;
    }

    public update(): void {
        if (!this._down) this._isDown = this._wasDown = false;
        else if (!this._isDown) this._isDown = true;
        else this._wasDown = true;
    }
}