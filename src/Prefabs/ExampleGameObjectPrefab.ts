import { ExampleBehaviour } from 'Behaviours/ExampleBehaviour';
import { Text } from 'GameObject/Components/Text';
import { AlignV, Assets, GameObject, Texture, Vector2 } from 'SE';

export async function ExampleGameObjectPrefab(gameObject: GameObject) {
    const text = await gameObject.addComponent(Text, text => {
        text.text = 'Move me with\nW/A/S/D or\nusing a Gamepad';
        text.textAlign = 'center';

        text.size = new Vector2(0, 1);

        text.alignV = AlignV.Center;

        text.zIndex = 1;
    });

    gameObject.addComponent(Texture, texture => {
        texture.asset = Assets.get('some image');
        texture.size = new Vector2(text.sprite?.width, text.sprite?.height);
    });


    // adding a behaviour will execute it's "Awake" method which is asynchronous
    await gameObject.addComponent(ExampleBehaviour);
}