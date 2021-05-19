import { RectangleCollider } from 'GameObject/Components/RectangleCollider';
import { Color, GameObject, Shape, Texture } from 'SE';

export function FloorColliderTest(gameObject: GameObject): void {
    gameObject.transform.position.y = -4.5;
    gameObject.transform.scale.x = 16;


    gameObject.addComponent(Texture, texture => {
        texture.asset = Shape.createRect(Color.yellow);
    });

    gameObject.addComponent(RectangleCollider, collider => {
        collider.isTrigger = false;
    });
}