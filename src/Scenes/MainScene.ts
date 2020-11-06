import { CameraPrefab } from '../Prefabs/CameraPrefab.js';
import { ExampleGameObjectPrefab } from '../Prefabs/ExampleGameObjectPrefab.js';
import { Scene } from '../SnowballEngine/SE.js';

export async function MainScene(scene: Scene) {
    // add gameobjects to scene
    await scene.addGameObject('something', ExampleGameObjectPrefab);

    // add a camera
    scene.addGameObject('Camera', CameraPrefab);
}