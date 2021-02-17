import { LoadingScreenScene } from './Scenes/LoadingScreenScene';
import { MainScene } from './Scenes/MainScene';
import { Asset, Assets, asyncTimeout, Color, createSprite, SceneManager } from './SnowballEngine/SE';

export class Game {
    public constructor() {
        this.initialize(new SceneManager());
    }
    private async initialize(sceneManager: SceneManager): Promise<void> {
        // create scenes
        sceneManager.create('Loadingscreen', LoadingScreenScene);
        sceneManager.create('Main Scene', MainScene);


        // load scene
        await sceneManager.load('Loadingscreen');

        // load
        // from assetDB:
        // await Assets.loadFromAssetDB();
        // or load a single asset
        // await Assets.load('path/to/asset', AssetType.Image, 'some image');
        // or create an asset
        Assets.set(createSprite((ctx, c) => { ctx.fillStyle = Color.yellow.rgbaString; ctx.fillRect(0, 0, c.width, c.height); }), 'some image');


        // timeout to simulate example loadingscreen
        await asyncTimeout(2000);


        await sceneManager.load('Main Scene');
    }
}