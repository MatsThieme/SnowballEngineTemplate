import { Timeout } from './Utilities/Timeout';

export class Framedata {
    public updateInterval: number;
    private lastTime: number;
    private avgFramesPerSecond: number;
    private frames: number;
    private totalFrames: number;

    public constructor(update = 1000) {
        this.updateInterval = update;
        this.lastTime = performance.now();
        this.avgFramesPerSecond = 0;
        this.frames = 0;
        this.totalFrames = 0;
    }

    /**
     * 
     * Calculates fps.
     * 
     */
    public update(time = performance.now()): void {
        this.frames++;
        this.totalFrames++;

        const now = time;
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
    public get fps(): number {
        return this.avgFramesPerSecond;
    }


    /**
     * 
     * measure fps for milliseconds
     * 
     */
    public async measureFps(milliseconds: number): Promise<number> {
        const frames = this.totalFrames;

        await new Timeout(milliseconds);

        return (this.totalFrames - frames) / milliseconds * 1000;
    }
}