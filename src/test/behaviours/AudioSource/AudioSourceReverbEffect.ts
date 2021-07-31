import { Assets, AudioEffectReverb, AudioListener, AudioMixer, AudioSource, Destroy, Dispose, Timeout } from 'SE';
import { TestBehaviour } from 'test/TestBehaviour';

export class AudioSourceReverbEffect extends TestBehaviour {
    name = 'AudioSource: mixer + reverb effect + remove effect after 3s';
    description = 'AudioSource: mixer + reverb effect + remove effect after 3s';
    duration = 6;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, s => { s.asset = Assets.get('audio'); })!;
        const mixer = source.mixer = new AudioMixer('mixer');


        const e = mixer.addEffect(AudioEffectReverb);

        source.play();

        await new Timeout(3000);

        mixer.removeEffect(e);

        await new Timeout(3000);


        Destroy(source);
        Dispose(mixer);
    }
}