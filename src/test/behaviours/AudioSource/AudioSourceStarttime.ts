import { Assets, AudioListener, AudioSource, Destroy } from 'SE';
import { TestBehaviour } from 'test/TestBehaviour';

export class AudioSourceStarttime extends TestBehaviour {
    name = 'AudioSource: startTime = 25';
    description = 'AudioSource: startTime = 25';
    duration = (<AudioBuffer>Assets.get('audio')!.data).duration - 25;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, s => { s.asset = Assets.get('audio'); })!;


        source.asset = Assets.get('audio');

        source.startTime = 25;

        source.play();

        await source.getEventPromise('end');


        Destroy(source);
    }
}