import { LoadingScreenPrefab } from 'Prefabs/LoadingScreenPrefab';
import { Scene } from 'SE';

export async function LoadingScreenScene(scene: Scene) {
    await scene.ui.addMenu('Loadingscreen', LoadingScreenPrefab);
}