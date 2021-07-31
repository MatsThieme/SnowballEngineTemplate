import { Assets, AudioListener, AudioSource, Destroy, Timeout } from 'SE';
import { TestBehaviour } from 'test/TestBehaviour';

export class AudioSourceCurrenttime extends TestBehaviour {
    name = 'audioSource.currentTime';
    description = 'currentTime controls is current playback position in seconds';
    duration = (<AudioBuffer>Assets.get('audio')!.data).duration - 25;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, s => { s.asset = Assets.get('audio'); })!;


        source.play();

        await new Timeout(2000);

        source.currentTime = 25;

        await source.getEventPromise('end');


        Destroy(source);
    }
}