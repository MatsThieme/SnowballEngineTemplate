import { D } from '../Debug.js';
import { AnimatedSprite } from '../GameObject/Components/AnimatedSprite.js';
import { Camera } from '../GameObject/Components/Camera.js';
import { CircleRenderer } from '../GameObject/Components/CircleRenderer.js';
import { ComponentType } from '../GameObject/Components/ComponentType.js';
import { ParticleSystem } from '../GameObject/Components/ParticleSystem.js';
import { PolygonRenderer } from '../GameObject/Components/PolygonRenderer.js';
import { Texture } from '../GameObject/Components/Texture.js';
import { TileMap } from '../GameObject/Components/TileMap.js';
import { GameObject } from '../GameObject/GameObject.js';
import { Scene } from '../Scene.js';
import { UIFrame } from '../UI/UIFrame.js';
import { Frame } from './Frame.js';

export class CameraManager {
    private context: CanvasRenderingContext2D;
    public cameras: Camera[];
    public mainCameraIndex: number;
    private cleared: boolean;
    public constructor(domElement: HTMLCanvasElement) {
        this.cameras = [];
        this.mainCameraIndex = 0;
        this.context = domElement.getContext('2d')!;
        this.context.imageSmoothingQuality = 'high';
        this.context.imageSmoothingEnabled = true;
        this.cleared = false;
    }
    public get mainCamera(): Camera | undefined {
        return this.cameras[this.mainCameraIndex % this.cameras.length];
    }
    public update(gameObjects: GameObject[]) {
        if (!this.mainCamera) {
            D.error('No camera to render');
            return;
        }

        if (this.context.canvas.width !== this.mainCamera.resolution.x) this.context.canvas.width = this.mainCamera.resolution.x;
        if (this.context.canvas.height !== this.mainCamera.resolution.y) this.context.canvas.height = this.mainCamera.resolution.y;

        let frames: (Frame | undefined)[] = [];

        for (const gameObject of gameObjects) {
            if (!gameObject.active) continue;
            frames.push(...gameObject.getComponents<PolygonRenderer>(ComponentType.PolygonRenderer).map(pR => pR.currentFrame));
            frames.push(...gameObject.getComponents<CircleRenderer>(ComponentType.CircleRenderer).map(cR => cR.currentFrame));
            frames.push(...gameObject.getComponents<AnimatedSprite>(ComponentType.AnimatedSprite).map(aS => aS.currentFrame));
            frames.push(...gameObject.getComponents<Texture>(ComponentType.Texture).map(t => t.currentFrame));
            frames.push(...gameObject.getComponents<ParticleSystem>(ComponentType.ParticleSystem).reduce((t: Frame[], c) => { t.push(...(<Frame[]>c.currentFrame)); return t; }, []));
            frames.push(...gameObject.getComponents<TileMap>(ComponentType.TileMap).reduce((t: Frame[], c) => { t.push(...(<Frame[]>c.currentFrame)); return t; }, []));
        }

        frames = frames.filter(f => f).sort((a, b) => <number>a?.drawPriority - <number>b?.drawPriority);

        this.cameras.forEach(camera => camera.update(<Frame[]>frames));

        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.cleared = true;

        this.context.drawImage(this.mainCamera.currentFrame, 0, 0);
    }
    public drawUI(ui: UIFrame) {
        if (!this.mainCamera) {
            D.error('No camera to render');
            return;
        }

        if (this.context.canvas.width !== this.mainCamera.resolution.x) this.context.canvas.width = this.mainCamera.resolution.x;
        if (this.context.canvas.height !== this.mainCamera.resolution.y) this.context.canvas.height = this.mainCamera.resolution.y;

        if (!this.cleared) this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        this.context.drawImage(ui.sprite, ui.aabb.position.x, ui.aabb.position.y, ui.aabb.size.x, ui.aabb.size.y);
        this.cleared = false;
    }
}