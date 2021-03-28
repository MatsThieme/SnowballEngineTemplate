import { GC_MODES } from '@pixi/constants';
import { Renderer } from '@pixi/core';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Sprite } from '@pixi/sprite';
import projectConfig from '../../../SnowballEngineConfig.json';
import { Client } from '../Client';
import { Debug } from '../Debug';

export class PIXI {
    public readonly renderer: Renderer;
    public readonly container: Container;
    public uiContainer!: Container;

    public constructor(width: number, height: number) {
        this.renderer = new Renderer({
            width,
            height,
            antialias: projectConfig.settings.PIXIjsAntialiasing,
            useContextAlpha: projectConfig.settings.transparentBackground,
            powerPreference: Client.isMobile ? 'low-power' : 'high-performance',
            clearBeforeRender: false
        });

        this.renderer.textureGC.mode = GC_MODES.AUTO;

        this.container = new Container();
        this.container.interactiveChildren = false;

        this.container.name = 'Renderer';

        this.container.mask = new Graphics();
    }

    public get canvas(): HTMLCanvasElement {
        return this.renderer.view;
    }

    public resize(width: number, height: number): void {
        if (this.renderer.context.isLost) Debug.warn('context lost');
        else if (this.renderer.width !== width || this.renderer.height !== height) this.renderer.resize(width, height);
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

    public renderUI(): void {
        this.renderer.render(this.uiContainer);
    }

    public destroy(): void {
        this.container.destroy({ children: true, texture: true, baseTexture: false });
        this.renderer.destroy();
    }
}