import {
    Assets,
    AudioEffectVolume,
    AudioListener,
    AudioMixer,
    AudioSource,
    Destroy,
    Dispose,
    Interval,
    Timeout,
} from "SE";
import { TestBehaviour } from "test/TestBehaviour";

export class AudioSourceVolumeEffect extends TestBehaviour {
    name = "AudioSource: mixer + volume effect";
    description = "AudioSource: mixer + volume effect";
    duration = 5;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, (s) => {
            s.asset = Assets.get("audio");
        })!;
        const mixer = (source.mixer = new AudioMixer("mixer"));

        const e = mixer.addEffect(AudioEffectVolume, (e) => {
            e.value = 0;
        });

        source.play();

        const i = new Interval(() => {
            e.value += 0.04;
        }, 100);

        await new Timeout(5000);

        i.clear();

        Destroy(source);
        Dispose(mixer);
    }
}
