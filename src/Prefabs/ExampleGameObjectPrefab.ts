import { ExampleBehaviour } from "Behaviours/ExampleBehaviour";
import { AlignV, Assets, GameObject, Text, Texture } from "SE";

export async function ExampleGameObjectPrefab(gameObject: GameObject) {
    const text = await gameObject.addComponent(Text, (text) => {
        text.text = "Move me with\nW/A/S/D or\nusing a Gamepad";
        text.textAlign = "center";

        text.alignV = AlignV.Center;

        text.zIndex = 1;
    });

    await gameObject.addComponent(Texture, (texture) => {
        texture.asset = Assets.get("some image");
        texture.size = text.size;
    });

    // adding a behaviour will execute it's "Awake" method which is asynchronous
    await gameObject.addComponent(ExampleBehaviour);
}
