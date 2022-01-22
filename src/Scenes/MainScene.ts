import { CameraPrefab } from "Prefabs/CameraPrefab";
import { ColliderTest } from "Prefabs/ColliderTest";
import { ExampleGameObjectPrefab } from "Prefabs/ExampleGameObjectPrefab";
import { FloorColliderTest as FloorCollider } from "Prefabs/FloorCollider";
import { Instantiate, Scene } from "SE";

export function MainScene(scene: Scene): void {
    // add gameobjects to scene
    Instantiate("something", ExampleGameObjectPrefab);

    // add a camera
    Instantiate("Camera", CameraPrefab);

    Instantiate("floor", FloorCollider);

    Instantiate("collider", ColliderTest);

    scene.physics.drawDebug = false;
}
