import { Assets, AudioListener, AudioSource, Destroy, Timeout } from 'SE';
import { TestBehaviour } from 'test/TestBehaviour';

export class AudioSourcePause extends TestBehaviour {
    name = 'AudioSource: pause 1s';
    description = 'AudioSource: pause 1s';
    duration = (<AudioBuffer>Assets.get('audio')!.data).duration - 20 + 1;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, s => { s.asset = Assets.get('audio'); })!;


        source.endTime = source.duration - 20;
        source.play();

        await new Timeout(source.endTime / 2 * 1000);

        source.pause();

        await new Timeout(1000);

        source.play();

        await source.getEventPromise('end');


        Destroy(source);
    }
}