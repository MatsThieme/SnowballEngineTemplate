import { CameraPrefab } from '../Prefabs/CameraPrefab';
import { ExampleGameObjectPrefab } from '../Prefabs/ExampleGameObjectPrefab';
import { Scene } from '../SnowballEngine/SE';

export async function MainScene(scene: Scene) {
    // add gameobjects to scene
    await scene.addGameObject('something', ExampleGameObjectPrefab);

    // add a camera
    scene.addGameObject('Camera', CameraPrefab);
}