import { Rigidbody } from "GameObject/Components/Rigidbody";
import { CameraPrefab } from "Prefabs/CameraPrefab";
import { ColliderTest } from "Prefabs/ColliderTest";
import { ExampleGameObjectPrefab } from "Prefabs/ExampleGameObjectPrefab";
import { FloorColliderTest as FloorCollider } from "Prefabs/FloorCollider";
import { FPSDisplayPrefab } from "Prefabs/FPSDisplayPrefab";
import {
    ComponentType,
    EventHandler,
    GameObject,
    Input,
    Instantiate,
    Scene,
    Vector2,
} from "SE";

export function MainScene(scene: Scene): void {
    // add gameobjects to scene
    Instantiate("something", ExampleGameObjectPrefab);

    // add a camera
    Instantiate("Camera", CameraPrefab);

    scene.ui.addMenu("FPS Display", FPSDisplayPrefab);

    Instantiate("floor", FloorCollider);

    Instantiate("collider", ColliderTest);

    Input.addListener(
        "Trigger",
        new EventHandler((e) => {
            if (e.button?.click) {
                scene.physics.drawDebug = !scene.physics.drawDebug;
            }
        })
    );

    Input.addListener(
        "Jump",
        new EventHandler((e) => {
            if (e.button?.click) {
                const rect = GameObject.find("collider");

                if (!rect) return;

                const rb = rect.getComponent<Rigidbody>(
                    ComponentType.Rigidbody
                );

                if (!rb) return;

                rb.applyForce(new Vector2(0, 0.000005));
            }
        })
    );

    scene.physics.drawDebug = true;
}
