import { RigidBody } from 'GameObject/Components/RigidBody';
import { CameraPrefab } from 'Prefabs/CameraPrefab';
import { ExampleGameObjectPrefab } from 'Prefabs/ExampleGameObjectPrefab';
import { ColliderTest } from 'Prefabs/FirstColliderTest';
import { FloorColliderTest as FloorCollider } from 'Prefabs/FloorCollider';
import { FPSDisplayPrefab } from 'Prefabs/FPSDisplayPrefab';
import { ComponentType, GameObject, Input, Instantiate, Scene, Vector2 } from 'SE';

export async function MainScene(scene: Scene) {
    // add gameobjects to scene
    await Instantiate('something', ExampleGameObjectPrefab);

    // add a camera
    await Instantiate('Camera', CameraPrefab);

    await scene.ui.addMenu('FPS Display', FPSDisplayPrefab);

    await Instantiate('floor', FloorCollider);

    await Instantiate('collider', ColliderTest);


    Input.addListener('Trigger', e => {
        if (e.button?.click) {
            scene.physics.drawDebug = !scene.physics.drawDebug;
        }
    });

    Input.addListener('Jump', e => {
        if (e.button?.click) {
            const rect = GameObject.find('collider');

            if (!rect) return;

            const rb = rect.getComponent<RigidBody>(ComponentType.RigidBody);

            if (!rb) return;

            rb.applyForce(new Vector2(0, 0.000005));
        }
    });



    scene.physics.drawDebug = true;
}