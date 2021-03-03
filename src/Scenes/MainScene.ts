import { CameraPrefab } from '../Prefabs/CameraPrefab';
import { ExampleGameObjectPrefab } from '../Prefabs/ExampleGameObjectPrefab';
import { FPSDisplayPrefab } from '../Prefabs/FPSDisplayPrefab';
import { Instantiate } from '../SnowballEngine/GameObject/Instantiate';
import { Scene } from '../SnowballEngine/SE';

export async function MainScene(scene: Scene) {
    // add gameobjects to scene
    await Instantiate('something', ExampleGameObjectPrefab);

    // add a camera
    Instantiate('Camera', CameraPrefab);

    scene.ui.addMenu('fpsDisplay', FPSDisplayPrefab);
}