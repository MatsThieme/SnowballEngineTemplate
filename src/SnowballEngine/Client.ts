import { asyncTimeout, triggerOnUserInputEvent } from './Helpers.js';
import { Vector2 } from './Vector2.js';

export class Client {
    /**
     * 
     * Measure the refresh rate of the active monitor for ms.
     * 
     */
    private static async measureMaxRefreshRate(ms: number): Promise<number> {
        let frames: number = 0;
        let handle = requestAnimationFrame(update);

        function update() {
            frames++;
            handle = requestAnimationFrame(update);
        }

        await asyncTimeout(ms);

        cancelAnimationFrame(handle);
        return Math.round(frames / ms * 1000);
    }

    /**
     *
     * Returns the resolution of the window.
     * 
     */
    public static resolution: Vector2 = new Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);

    public static monitorRefreshRate: number = 144;
    public static aspectRatio: Vector2 = Client.resolution.clone.setLength(new Vector2(16, 9).magnitude);

    public static requestFullscreen(element: HTMLElement): void {
        triggerOnUserInputEvent(() => {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if ((<any>element).mozRequestFullScreen) { /* Firefox */
                (<any>element).mozRequestFullScreen();
            } else if ((<any>element).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                (<any>element).webkitRequestFullscreen();
            } else if ((<any>element).msRequestFullscreen) { /* IE/Edge */
                (<any>element).msRequestFullscreen();
            }
        });
    }

    public static exitFullscreen(): void {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((<any>document).mozCancelFullScreen) { /* Firefox */
            (<any>document).mozCancelFullScreen();
        } else if ((<any>document).webkitExitFullscreen) { /* Chrome, Safari and Opera */
            (<any>document).webkitExitFullscreen();
        } else if ((<any>document).msExitFullscreen) { /* IE/Edge */
            (<any>document).msExitFullscreen();
        }
    }

    /**
     * 
     * Returns the number of available cpu threads.
     * 
     */
    public static readonly cpuThreads: number = navigator.hardwareConcurrency;
    private static async start() {
        addEventListener('resize', () => {
            Client.resolution.x = window.innerWidth * window.devicePixelRatio;
            Client.resolution.y = window.innerHeight * window.devicePixelRatio;

            Client.aspectRatio.copy(Client.resolution.clone.setLength(new Vector2(16, 9).magnitude));

            Client.onResizeCbs.forEach(cb => cb(Client));
        });

        Client.monitorRefreshRate = await Client.measureMaxRefreshRate(1000);
    }
    private static readonly onResizeCbs: ((client: Client) => any)[] = [];
    public static OnResize(cb: (client: Client) => any): void {
        Client.onResizeCbs.push(cb);
    }
}

(<any>Client).start();