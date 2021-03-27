import isMobile from 'ismobilejs';
import { AudioListener } from './GameObject/Components/AudioListener';
import { Scene } from './Scene';
import { triggerOnUserInputEvent } from './Utilities/Helpers';
import { Timeout } from './Utilities/Timeout';
import { Vector2 } from './Utilities/Vector2';

export class Client {
    public static platform: 'android' | 'ios' | 'browser' | 'windows' | 'osx' = <any>(window.cordova || {}).platformId || 'browser';
    public static isMobile: boolean = isMobile(navigator).any;

    /**
     *
     * Returns the resolution of the window.
     * 
     */
    public static readonly resolution: ImmutableObject<Vector2> = new Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio).round();

    public static monitorRefreshRate = 60;

    public static aspectRatio: Vector2 = (<Vector2>Client.resolution).clone.setLength(new Vector2(16, 9).magnitude);

    public static readonly hasMediaPlayPermission: boolean;

    /**
     * 
     * Measure the refresh rate of the active monitor for ms.
     * 
     */
    private static async measureMonitorRefreshRate(ms: number): Promise<number> {
        let frames = 0;
        let handle = requestAnimationFrame(update);

        function update() {
            frames++;
            handle = requestAnimationFrame(update);
        }

        await new Timeout(ms);

        cancelAnimationFrame(handle);

        return Math.round(frames / ms * 1000);
    }

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

    private static resizeListener?: () => void;

    public static async init(): Promise<void> {
        const el = Scene.currentScene?.domElement || window;

        if (Client.resizeListener) el.removeEventListener('resize', Client.resizeListener);

        Client.resizeListener = () => {
            const boundingClientRect = Scene.currentScene.domElement.getBoundingClientRect();

            (<Vector2>Client.resolution).x = (boundingClientRect?.width || window.innerWidth) * window.devicePixelRatio;
            (<Vector2>Client.resolution).y = (boundingClientRect?.height || window.innerHeight) * window.devicePixelRatio;

            (<Vector2>Client.resolution).round();

            Client.aspectRatio.copy((<Vector2>Client.resolution).clone.setLength(18.35)); // new Vector2(16, 9).magnitude = 18.35755975068582
        }

        el.addEventListener('resize', Client.resizeListener);


        if (!(<Mutable<typeof Client>>Client).hasMediaPlayPermission) {
            (<Mutable<typeof Client>>Client).hasMediaPlayPermission = AudioListener.context.state === 'running';

            AudioListener.context.addEventListener('statechange', e => (<Mutable<typeof Client>>Client).hasMediaPlayPermission = AudioListener.context.state === 'running');
        }

        Client.monitorRefreshRate = await Client.measureMonitorRefreshRate(100);
        Client.monitorRefreshRate = await Client.measureMonitorRefreshRate(1000);
    }
}