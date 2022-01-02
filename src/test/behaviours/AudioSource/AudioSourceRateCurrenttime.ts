import { Assets, AudioListener, AudioSource, Destroy, Interval, Timeout } from "SE";
import { TestBehaviour } from "test/TestBehaviour";

export class AudioSourceRateCurrenttime extends TestBehaviour {
    name = "AudioSource: playback rate + currenttime";
    description = "AudioSource: playback rate + currenttime";
    duration = 10;

    async test() {
        if (!this.scene.audioListener) await this.gameObject.addComponent(AudioListener);

        const source = await this.gameObject.addComponent(AudioSource, (s) => {
            s.asset = Assets.get("audio");
        })!;

        source.play();

        const i = new Interval(() => {
            source.rate += 0.001;
        }, 10);

        await new Timeout(5000);

        source.currentTime = 1;

        await new Timeout(5000);

        i.clear();

        Destroy(source);
    }
}
