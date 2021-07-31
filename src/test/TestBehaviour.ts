import { Behaviour } from 'SE';

export abstract class TestBehaviour extends Behaviour {
    abstract name: string;
    abstract description: string;
    /** approximate duration of the test in seconds */
    duration?: number;
    abstract test(): Promise<void> | void;
}