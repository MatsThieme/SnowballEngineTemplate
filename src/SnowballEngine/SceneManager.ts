import { Interval } from 'Utility/Interval';
import { Scene } from './Scene';

/** @category Scene */
export class SceneManager {
    private _scenes: Map<SceneName, { initializer: (scene: Scene) => any, scene?: Scene }>;
    private _activeScene?: SceneName;

    /**
    *
    * Returns the loaded Scene instance.
    *
    */
    public readonly scene?: Scene;

    public constructor() {
        this._scenes = new Map();
    }

    public add(name: SceneName, sceneCb: (scene: Scene) => any): void {
        this._scenes.set(name, { initializer: sceneCb });
    }

    public async load(name: SceneName): Promise<Scene> {
        if (name === this._activeScene) await this.unload(this._activeScene);


        const sO = this._scenes.get(name);

        if (sO) {
            Interval.clearAll();

            if (!sO.scene) {
                const scene = new Scene(this, name);
                (<Mutable<SceneManager>>this).scene = scene;

                await sO.initializer(scene);

                sO.scene = scene;
            }


            await sO.scene.start();


            if (this._activeScene) await this.unload(this._activeScene);


            this._activeScene = name;


            return sO.scene;
        }

        throw `No Scene named ${name} found`;
    }

    public async unload(name: SceneName): Promise<void> {
        const scene = this._scenes.get(name)?.scene;

        if (scene) {
            await scene.destroy();

            delete this._scenes.get(name)!.scene;

            this._activeScene = undefined;
        }
    }
}