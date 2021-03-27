import { Scene } from './Scene';
import { Interval } from './Utilities/Interval';

export class SceneManager {
    private scenes: Map<SceneName, { initializer: (scene: Scene) => any, scene?: Scene }>;
    private activeScene?: SceneName;

    /**
    *
    * Returns the loaded Scene instance.
    *
    */
    public readonly scene?: Scene;

    public constructor() {
        this.scenes = new Map();
    }

    public add(name: SceneName, sceneCb: (scene: Scene) => any): void {
        this.scenes.set(name, { initializer: sceneCb });
    }

    public async load(name: SceneName): Promise<Scene> {
        if (name === this.activeScene) await this.unload(this.activeScene);


        const sO = this.scenes.get(name);

        if (sO) {
            Interval.clearAll();

            if (!sO.scene) {
                const scene = new Scene(this, name);
                (<Mutable<SceneManager>>this).scene = scene;

                await sO.initializer(scene);

                sO.scene = scene;
            }


            await sO.scene.start();


            if (this.activeScene) await this.unload(this.activeScene);


            this.activeScene = name;


            return sO.scene;
        }

        throw `No Scene named ${name} found`;
    }

    public async unload(name: SceneName): Promise<void> {
        const scene = this.scenes.get(name)?.scene;

        if (scene) {
            await scene.destroy();

            delete this.scenes.get(name)!.scene;

            this.activeScene = undefined;
        }
    }
}