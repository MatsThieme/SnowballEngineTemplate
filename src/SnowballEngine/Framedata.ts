export class Framedata {
    public updateInterval: number;
    private lastTime: number;
    private avgFramesPerSecond: number;
    private frames: number;
    public constructor(update = 1000) {
        this.updateInterval = update;
        this.lastTime = performance.now();
        this.avgFramesPerSecond = 0;
        this.frames = 0;
    }

    /**
     * 
     * Calculates fps.
     * 
     */
    public update() {
        this.frames++;
        const now = performance.now();
        const delta = now - this.lastTime;

        if (delta >= this.updateInterval) {
            const tF = this.frames / (delta / this.updateInterval);
            this.avgFramesPerSecond = Math.round(tF / (delta / 1000));
            this.frames -= tF;
            this.lastTime = now;
        }
    }

    /**
     *
     * Returns the average frames per second 
     * 
     */
    public get fps() {
        return this.avgFramesPerSecond;
    }
}