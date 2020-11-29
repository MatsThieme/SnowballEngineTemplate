import { LoadingScreenScene } from './Scenes/LoadingScreenScene';
import { MainScene } from './Scenes/MainScene';
import { Asset, Assets, asyncTimeout, Color, createSprite, SceneManager } from './SnowballEngine/SE';

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
        await sceneManager.load('Loadingscreen');

        // load
        // form assetDB:
        // await Assets.loadFromAssetDB();
        // or load a single asset
        // await Assets.load('path/to/asset', AssetType.Image, 'some image');
        // or create an asset
        const someasset: Asset = createSprite((ctx, c) => {
            ctx.fillStyle = Color.yellow.colorString;
            ctx.fillRect(0, 0, c.width, c.height);
        });
        
        Assets.set(someasset, 'some image');


        // timeout to simulate loadingscreen
        await asyncTimeout(2000);


        await sceneManager.load('Main Scene');
    }
}