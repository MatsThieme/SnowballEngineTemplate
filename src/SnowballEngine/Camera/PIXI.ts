import { GC_MODES } from "@pixi/constants";
import { Renderer } from "@pixi/core";
import { Container } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import { Sprite } from "@pixi/sprite";
import projectConfig from "Config";
import { Client } from "SnowballEngine/Client";
import { Debug } from "SnowballEngine/Debug";

export class PIXI {
    public readonly renderer: Renderer;
    public readonly container: Container;

    public constructor(domElement: HTMLCanvasElement, width: number, height: number) {
        this.renderer = new Renderer({
            width,
            height,
            antialias: projectConfig.settings.PIXIjsAntialiasing,
            useContextAlpha: projectConfig.settings.transparentBackground,
            backgroundAlpha: projectConfig.settings.transparentBackgroundAlpha,
            powerPreference: "low-power" || Client.isMobile ? "low-power" : "high-performance",
            clearBeforeRender: false,
            view: domElement,
        });

        this.renderer.textureGC.maxIdle = 60;

        this.renderer.plugins.interaction.destroy();

        this.renderer.textureGC.mode = GC_MODES.AUTO;

        this.container = new Container();

        this.container.name = "Game Renderer";

        this.container.mask = new Graphics();
    }

    public get canvas(): HTMLCanvasElement {
        return this.renderer.view;
    }

    public resize(width: number, height: number): void {
        if (this.renderer.context.isLost) Debug.warn("context lost");
        else if (this.renderer.width !== width || this.renderer.height !== height)
            this.renderer.resize(width, height);
    }

    public addChild(child: Sprite | Container): void {
        this.container.addChild(child);
    }
    public removeChild(child: Sprite | Container): void {
        this.container.removeChild(child);
    }

    public render(): void {
        this.renderer.render(this.container);
    }

    public destroy(): void {
        this.container.destroy(true);
        this.renderer.destroy();
    }
}
