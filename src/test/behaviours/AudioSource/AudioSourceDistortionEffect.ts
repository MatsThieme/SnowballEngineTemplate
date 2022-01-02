import {
    Assets,
    AudioEffectDistortion,
    AudioListener,
    AudioMixer,
    AudioSource,
    Destroy,
    Dispose,
    Timeout,
} from "SE";
import { TestBehaviour } from "test/TestBehaviour";

export class AudioSourceDistortionEffect extends TestBehaviour {
    name = "AudioSource: mixer + distortion effect";
    description = "AudioSource: mixer + distortion effect";
    duration = 5;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, (s) => {
            s.asset = Assets.get("audio");
        })!;
        const mixer = (source.mixer = new AudioMixer("mixer"));

        mixer.addEffect(AudioEffectDistortion);

        source.play();

        await new Timeout(5000);

        Destroy(source);
        Dispose(mixer);
    }
}
