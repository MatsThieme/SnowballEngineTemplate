import { LoadingScreenScene } from './Scenes/LoadingScreenScene.js';
import { MainScene } from './Scenes/MainScene.js';
import { Asset, Assets, asyncTimeout, Color, createSprite, SceneManager } from './SnowballEngine/SE.js';

export class Game {
    private readonly sceneManager: SceneManager;
    public constructor() {
        this.sceneManager = new SceneManager();
        this.initialize(this.sceneManager);
    }
    private async initialize(sceneManager: SceneManager): Promise<void> {
        // create scenes
        sceneManager.create('Loadingscreen', LoadingScreenScene);
        sceneManager.create('Main Scene', MainScene);


        // load scene
        sceneManager.load('Loadingscreen');

        // load
        // await Assets.load('path/to/asset', AssetType.Image, 'some image');
        // or
        // create asset
        const someasset: Asset = createSprite((ctx, c) => {
            ctx.fillStyle = Color.yellow.colorString;
            ctx.fillRect(0, 0, c.width, c.height);
        });
        Assets.set(someasset, 'some image');


        // timeout to simulate loadingscreen
        await asyncTimeout(2000);


        sceneManager.load('Main Scene');
    }
}