import { Assets, AudioListener, AudioMixer, AudioSource, Destroy, Dispose, Timeout } from 'SE';
import { TestBehaviour } from 'test/TestBehaviour';

export class AudioSourceVolume extends TestBehaviour {
    name = 'AudioSource: 3s volume=1 + 3s volume=0.2';
    description = 'AudioSource: 3s volume=1 + 3s volume=0.2';
    duration = 6;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, s => { s.asset = Assets.get('audio'); })!;
        const mixer = source.mixer = new AudioMixer('mixer');


        source.play();

        await new Timeout(3000);

        mixer.volume = 0.2;

        await new Timeout(3000);


        Destroy(source);
        Dispose(mixer);
    }
}