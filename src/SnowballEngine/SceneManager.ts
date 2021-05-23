import { Interval } from 'Utility/Interval';
import { Scene } from './Scene';

/** @category Scene */
export class SceneManager {
    /**
    *
    * Returns the loaded Scene instance.
    *
    */
    public readonly scene?: Scene;

    private _scenes: Map<SceneName, (scene: Scene) => Promise<void> | void>;

    public constructor() {
        this._scenes = new Map();
    }

    public add(name: SceneName, sceneInitializer: (scene: Scene) => Promise<void> | void): void {
        this._scenes.set(name, sceneInitializer);
    }

    public async load(name: SceneName): Promise<Scene> {
        const initializer = this._scenes.get(name);

        if (initializer) {
            Interval.clearAll();

            if (this.scene) await this.unload();

            const scene = new Scene(this, name);
            (<Mutable<SceneManager>>this).scene = scene;


            await initializer(scene);
            await scene.start();

            return scene;
        }

        throw `No Scene named ${name} found`;
    }

    /**
     * 
     * Unload the current scene.
     * 
     */
    public async unload(): Promise<void> {
        await this.scene?.unload();
    }
}