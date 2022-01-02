import {
    Assets,
    AudioEffectDelay,
    AudioListener,
    AudioMixer,
    AudioSource,
    Destroy,
    Dispose,
    Timeout,
} from "SE";
import { TestBehaviour } from "test/TestBehaviour";

export class AudioSourceDelayEffect extends TestBehaviour {
    name = "AudioSource, AudioMixer, AudioEffectDelay";
    description = "Add delay effect(1s) after 2s, remove after 2s, wait 2s";
    duration = 6;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, (s) => {
            s.asset = Assets.get("audio");
        })!;
        const mixer = (source.mixer = new AudioMixer("mixer"));

        source.play();

        await new Timeout(2000);

        const e = mixer.addEffect(AudioEffectDelay, (e) => {
            e.seconds = 1;
        });

        await new Timeout(2000);

        mixer.removeEffect(e);

        await new Timeout(2000);

        Destroy(source);
        Dispose(mixer);
    }
}
