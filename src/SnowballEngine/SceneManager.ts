import { Scene } from './Scene';
import { clearAllIntervals } from './Utilities/Helpers';

export class SceneManager {
    private scenes: Map<string, { cb: (scene: Scene) => any, scene?: Scene }>;
    private activeScene?: string;

    /**
    *
    * Returns the loaded Scene instance.
    *
    */
    public readonly scene?: Scene;

    public constructor() {
        this.scenes = new Map();
    }

    public add(name: string, sceneCb: (scene: Scene) => any): void {
        this.scenes.set(name, { cb: sceneCb });
    }

    public async load(name: string): Promise<Scene> {
        if (name === this.activeScene) await this.unload(this.activeScene);


        const sO = this.scenes.get(name);

        if (sO) {
            clearAllIntervals();

            if (!sO.scene) {
                const scene = new Scene(this, name);
                (<any>this).scene = scene;

                await sO.cb(scene);

                sO.scene = scene;
            }


            await sO.scene.start();


            if (this.activeScene) await this.unload(this.activeScene);


            this.activeScene = name;


            return sO.scene;
        }

        throw `No Scene named ${name} found`;
    }

    public async unload(name: string) {
        const scene = this.scenes.get(name)?.scene;

        if (scene) {
            await scene.destroy();

            delete this.scenes.get(name)!.scene;

            this.activeScene = undefined;
        }
    }
}