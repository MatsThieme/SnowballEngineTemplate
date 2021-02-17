import { autoDetectRenderer, Container, Sprite } from 'pixi.js';
import { Client } from '../Client';
import { D } from '../Debug';

export class PIXI {
    public readonly renderer: PIXI.Renderer;
    public readonly container: PIXI.Container;

    public constructor(width: number, height: number) {
        this.renderer = autoDetectRenderer({
            width,
            height,
            antialias: project.settings.PIXIjsAntialiasing,
            transparent: project.settings.transparentBackground,
            powerPreference: Client.isMobile ? 'low-power' : 'high-performance',
            clearBeforeRender: true
        });

        this.renderer.on('context', console.log);

        this.container = new Container();
        this.container.interactiveChildren = false;
    }

    public get canvas(): HTMLCanvasElement {
        return this.renderer.view;
    }

    public resize(width: number, height: number): void {
        if (this.renderer.context.isLost) D.error('context lost');
        else this.renderer.resize(width, height);
    }

    public addChild(child: Sprite | Container) {
        this.container.addChild(child);
    }
    public removeChild(child: Sprite | Container) {
        this.container.removeChild(child);
    }

    public render(): void {
        this.renderer.render(this.container);
    }

    public destroy(): void {
        this.container.destroy({ children: true, texture: true, baseTexture: false}); // TODO: test
        this.renderer.destroy();
    }
}