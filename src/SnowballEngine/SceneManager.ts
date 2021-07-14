import { Interval } from 'Utility/Interval/Interval';
import { Scene } from './Scene';

/** @category Scene */
export class SceneManager {
    /**
    *
    * Returns the loaded Scene instance.
    *
    */
    public readonly scene?: Scene;

    private _scenes: Partial<Record<SceneName, (scene: Scene) => Promise<void> | void>>;

    public constructor() {
        this._scenes = {};
    }

    public add(name: SceneName, sceneInitializer: (scene: Scene) => Promise<void> | void): void {
        if (this._scenes[name]) throw new Error('Scene exists');

        this._scenes[name] = sceneInitializer;
    }

    public async load(name: SceneName): Promise<Scene> {
        const initializer = this._scenes[name];

        if (initializer) {
            Interval.clearAll();

            if (this.scene) await this.scene.unload();

            const scene = new Scene(this, name);
            (<Mutable<SceneManager>>this).scene = scene;


            await initializer(scene);
            await scene.start();

            return scene;
        }

        throw new Error(`No Scene named ${name} found`);
    }
}