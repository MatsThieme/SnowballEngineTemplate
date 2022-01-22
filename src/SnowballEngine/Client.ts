import isMobile from "ismobilejs";
import { triggerOnUserInputEvent } from "Utility/Helpers";
import { Timeout } from "Utility/Timeout/Timeout";
import { Vector2 as IVector2, Vector2 } from "Utility/Vector2";
import { AudioListener } from "./GameObject/Components/AudioListener";
import { SceneManager } from "./SceneManager";

type Platform = "android" | "ios" | "browser" | "windows" | "osx";

export class Client {
    public static platform: Platform = ((window.cordova || {}).platformId as Platform) ?? "browser";
    public static isMobile: boolean = isMobile(navigator).any;

    /**
     *
     * Returns the resolution of the window.
     *
     */
    public static readonly resolution: Immutable<IVector2> = new Vector2(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
    ).round();

    public static aspectRatio: IVector2 = (<IVector2>Client.resolution).clone.setLength(
        new IVector2(16, 9).magnitude
    );

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

        return Math.round((frames / ms) * 1000);
    }

    public static async requestFullscreen(element: HTMLElement): Promise<void> {
        await triggerOnUserInputEvent(async () => {
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if ((element as any).mozRequestFullScreen) {
                /* Firefox */
                await (element as any).mozRequestFullScreen();
            } else if ((element as any).webkitRequestFullscreen) {
                /* Chrome, Safari and Opera */
                await (element as any).webkitRequestFullscreen();
            } else if ((element as any).msRequestFullscreen) {
                /* IE/Edge */
                await (element as any).msRequestFullscreen();
            }
        });
    }

    public static async exitFullscreen(): Promise<void> {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
            /* Firefox */
            await (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            /* IE/Edge */
            await (document as any).msExitFullscreen();
        }
    }

    private static _resizeListener(): void {
        const boundingClientRect = SceneManager.getInstance()?.canvasElement.getBoundingClientRect();
        (<IVector2>Client.resolution).x =
            (boundingClientRect?.width || window.innerWidth) * window.devicePixelRatio;
        (<IVector2>Client.resolution).y =
            (boundingClientRect?.height || window.innerHeight) * window.devicePixelRatio;
        (<Vector2>Client.resolution).round();
        Client.aspectRatio.copy((<IVector2>Client.resolution).clone.setLength(new IVector2(16, 9).magnitude));
    }

    static {
        window.addEventListener("resize", Client._resizeListener);

        document.addEventListener("fullscreenchange", () => window.dispatchEvent(new Event("resize")));

        if (!(<Mutable<typeof Client>>Client).hasMediaPlayPermission) {
            (<Mutable<typeof Client>>Client).hasMediaPlayPermission =
                AudioListener.context.state === "running";

            AudioListener.context.addEventListener("statechange", () => {
                (<Mutable<typeof Client>>Client).hasMediaPlayPermission =
                    AudioListener.context.state === "running";
            });
        }
    }
}
