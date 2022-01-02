import { Behaviour, Destroy } from 'SE';
import { AudioSourceCurrenttime } from './behaviours/AudioSource/AudioSourceCurrenttime';
import { AudioSourceDelayEffect } from './behaviours/AudioSource/AudioSourceDelayEffect';
import { AudioSourceDistortionEffect } from './behaviours/AudioSource/AudioSourceDistortionEffect';
import { AudioSourceEndtime } from './behaviours/AudioSource/AudioSourceEndtime';
import { AudioSourceLoop } from './behaviours/AudioSource/AudioSourceLoop';
import { AudioSourcePause } from './behaviours/AudioSource/AudioSourcePause';
import { AudioSourceRate } from './behaviours/AudioSource/AudioSourceRate';
import { AudioSourceRateCurrenttime } from './behaviours/AudioSource/AudioSourceRateCurrenttime';
import { AudioSourceReverbEffect } from './behaviours/AudioSource/AudioSourceReverbEffect';
import { AudioSourceStarttime } from './behaviours/AudioSource/AudioSourceStarttime';
import { AudioSourceVolume } from './behaviours/AudioSource/AudioSourceVolume';
import { AudioSourceVolumeEffect } from './behaviours/AudioSource/AudioSourceVolumeEffect';
import { GameObjectFind } from './behaviours/GameObject/GameObjectFind';
import { TestBehaviour } from './TestBehaviour';

export class RunTestsBehaviour extends Behaviour {
    tests: Constructor<TestBehaviour>[] = [
        GameObjectFind,
        AudioSourceStarttime,
        AudioSourceEndtime,
        AudioSourcePause,
        AudioSourceCurrenttime,
        AudioSourceRate,
        AudioSourceRateCurrenttime,
        AudioSourceLoop,
        AudioSourceVolume,
        AudioSourceDistortionEffect,
        AudioSourceReverbEffect,
        AudioSourceDelayEffect,
        AudioSourceVolumeEffect
    ];

    start() {
        this.runTests();
    }

    async runTests() {
        const css = {
            heading: 'background-color: #00f; color: #fff; padding: 0.2em; font-size: 1.5em;',
            description: 'background-color: #00f; color: #fff; padding: 0.2em 0.2em;',
            done: 'background-color: #0f0; padding: 0.2em; font-size: 1.5em;',
            failed: 'background-color: #f00; color: #fff; padding: 0.2em; font-size: 1.5em;'
        };

        let failed = 0;

        for (const Test of this.tests) {
            const test = await this.gameObject.addComponent(Test);

            console.log('%cRun test: ' + test.name + '\n%c' + test.description + '\n%ctest duration: ' + (test.duration?.toFixed(3) + 's' || 'not specified'), css.heading, css.description, css.description);

            try {
                await test.test();
                console.log('%cDone', css.done);
            } catch (e) {
                const m = ((<Error>e)?.message || e + '').trim();
                console.log(m && (<Error>e)?.message !== '' && e !== '' ? '%cTest failed: ' + m : '%cTest failed', css.failed);
                failed++;
            }

            Destroy(test);
        }

        if (failed) console.log(`%c${failed} test${failed !== 1 ? 's' : ''} failed`, css.failed);

        Destroy(this);
    }
}