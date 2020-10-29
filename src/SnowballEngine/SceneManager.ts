import { Scene } from './Scene.js';

export class SceneManager {
    private scenes: Map<string, { cb: (scene: Scene) => any, scene?: Scene }>;
    private activeScene?: string;
    public constructor() {
        this.scenes = new Map();
    }
    public create(name: string, sceneCb: (scene: Scene) => any): void {
        this.scenes.set(name, { cb: sceneCb });
    }
    public async load(name: string, unloadCurrentScene: boolean = true): Promise<Scene | void> {
        const s = this.scenes.get(name);

        if (s) {

            if (!s.scene) {
                let scene = new Scene(this);
                await s.cb(scene);
                s.scene = scene;
            }

            await s.scene.start();

            if (this.activeScene) {
                const currentScene = this.scenes.get(this.activeScene)!.scene!;

                currentScene.stop();

                if (unloadCurrentScene) {
                    currentScene.destroy();
                    delete this.scenes.get(this.activeScene)?.scene;
                }
            }


            this.activeScene = name;

            return s.scene;
        }
    }
    public unload(name: string) {
        if (this.scenes.has(name)) {
            const currentScene = this.scenes.get(name)!.scene!;

            currentScene.stop();

            currentScene.destroy();
            delete this.scenes.get(name)?.scene;
        }
    }
}