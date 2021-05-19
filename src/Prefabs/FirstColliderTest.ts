import { MoveBehaviour } from 'Behaviours/MoveBehaviour';
import { RectangleCollider } from 'GameObject/Components/RectangleCollider';
import { RigidBody } from 'GameObject/Components/RigidBody';
import { Color, GameObject, Shape, Texture } from 'SE';

export function ColliderTest(gameObject: GameObject): void {
    const child = new GameObject('child');
    const child2 = new GameObject('child2');
    gameObject.addChild(child);
    child.addChild(child2);

    // ---------------

    gameObject.addComponent(MoveBehaviour);
    gameObject.addComponent(RigidBody);
    gameObject.addComponent(RectangleCollider);
    gameObject.addComponent(Texture, texture => {
        texture.asset = Shape.createRect(Color.blue);
    });

    gameObject.transform.rotation.degree = 10;

    // ---------------

    child.addComponent(RectangleCollider);
    child.addComponent(Texture, texture => {
        texture.asset = Shape.createRect(Color.red);
    });

    child.transform.rotation.degree = 45;
    child.transform.scale.x = 0.5;
    child.transform.position.x = 1;

    // ---------------

    child2.addComponent(RectangleCollider);
    child2.addComponent(Texture, texture => {
        texture.asset = Shape.createRect(Color.yellow);
    });

    child2.transform.rotation.degree = 45;
    child2.transform.scale.x = 0.5;
    child2.transform.scale.y = 2;
}