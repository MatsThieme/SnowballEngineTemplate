import { asyncTimeout, triggerOnUserInputEvent } from './Helpers';
import { Vector2 } from './Vector2';

export class Client {
    public static platform: 'android' | 'ios' | 'browser' | 'windows' | 'osx' = <any>(window.cordova || {}).platformId || 'browser';
    /**
     * 
     * Measure the refresh rate of the active monitor for ms.
     * 
     */
    private static async measureMonitorRefreshRate(ms: number): Promise<number> {
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

    public static monitorRefreshRate: number = 0;

    public static aspectRatio: Vector2 = Client.resolution.clone.setLength(new Vector2(16, 9).magnitude);

    public static async requestFullscreen(element: HTMLElement): Promise<void> {
        await triggerOnUserInputEvent(async () => {
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if ((<any>element).mozRequestFullScreen) { /* Firefox */
                await (<any>element).mozRequestFullScreen();
            } else if ((<any>element).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                await (<any>element).webkitRequestFullscreen();
            } else if ((<any>element).msRequestFullscreen) { /* IE/Edge */
                await (<any>element).msRequestFullscreen();
            }
        });
    }

    public static async exitFullscreen(): Promise<void> {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if ((<any>document).mozCancelFullScreen) { /* Firefox */
            await (<any>document).mozCancelFullScreen();
        } else if ((<any>document).webkitExitFullscreen) { /* Chrome, Safari and Opera */
            await (<any>document).webkitExitFullscreen();
        } else if ((<any>document).msExitFullscreen) { /* IE/Edge */
            await (<any>document).msExitFullscreen();
        }
    }

    /**
     * 
     * Returns the number of available cpu threads.
     * 
     */
    public static readonly cpuThreads: number = navigator.hardwareConcurrency;

    public static async start(): Promise<void> {
        if (Client.monitorRefreshRate) return;
        Client.monitorRefreshRate = 1;

        addEventListener('resize', () => {
            Client.resolution.x = window.innerWidth * window.devicePixelRatio;
            Client.resolution.y = window.innerHeight * window.devicePixelRatio;

            Client.aspectRatio.copy(Client.resolution.clone.setLength(new Vector2(16, 9).magnitude));

            Client.onResizeCbs.forEach(cb => cb(Client));
        });

        Client.monitorRefreshRate = await Client.measureMonitorRefreshRate(1000);
    }

    private static readonly onResizeCbs: ((client: Client) => any)[] = [];

    public static OnResize(cb: (client: Client) => any): void {
        Client.onResizeCbs.push(cb);
    }
}