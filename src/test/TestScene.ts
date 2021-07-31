import { GameObject, Scene } from 'SE';
import { RunTestsBehaviour } from './RunTestsBehaviour';

export function TestScene(scene: Scene) {
    new GameObject('run tests').addComponent(RunTestsBehaviour);
}