import { Assets, AudioListener, AudioSource, Destroy, Timeout } from 'SE';
import { TestBehaviour } from 'test/TestBehaviour';

export class AudioSourceLoop extends TestBehaviour {
    name = 'AudioSource: loop';
    description = 'AudioSource: loop';
    duration = 5;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, s => { s.asset = Assets.get('audio'); })!;


        source.startTime = 5;
        source.endTime = 6;
        source.loop = true;
        source.rate = 1.1;

        source.play();

        await new Timeout(5000);


        Destroy(source);
    }
}