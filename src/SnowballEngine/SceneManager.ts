import { asyncTimeout } from './Helpers';
import { Scene } from './Scene';

export class SceneManager {
    private scenes: Map<string, { cb: (scene: Scene) => any, scene?: Scene }>;
    private activeScene?: string;
    public constructor() {
        this.scenes = new Map();
    }
    public create(name: string, sceneCb: (scene: Scene) => any): void {
        this.scenes.set(name, { cb: sceneCb });
    }
    public async load(name: string): Promise<Scene | void> {
        const sO = this.scenes.get(name);

        if (sO) {

            if (!sO.scene) {
                const scene = new Scene(this, name);

                await sO.cb(scene);

                sO.scene = scene;
            }

            await sO.scene.start();

            if (this.activeScene) await this.unload(this.activeScene);

            this.activeScene = name;

            await asyncTimeout(10);

            return sO.scene;
        }
    }
    public async unload(name: string) {
        if (this.scenes.get(name)?.scene) {
            const currentScene = this.scenes.get(name)!.scene!;

            await currentScene.destroy();

            delete this.scenes.get(name)!.scene;
        }
    }
}