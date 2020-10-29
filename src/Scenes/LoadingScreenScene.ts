import { CameraPrefab } from '../Prefabs/CameraPrefab.js';
import { LoadingScreenPrefab } from '../Prefabs/LoadingScreenPrefab.js';
import { Scene } from '../SnowballEngine/SE.js';

export function LoadingScreenScene(scene: Scene) {
    // add a camera
    scene.addGameObject('Camera', CameraPrefab);

    // show something to the waiting user
    scene.ui.addMenu('Loadingscreen', LoadingScreenPrefab);
}