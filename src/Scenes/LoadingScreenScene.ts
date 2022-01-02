import { LoadingScreenPrefab } from "Prefabs/LoadingScreenPrefab";
import { Scene } from "SE";

export function LoadingScreenScene(scene: Scene): void {
    scene.ui.addMenu("Loadingscreen", LoadingScreenPrefab);
}
