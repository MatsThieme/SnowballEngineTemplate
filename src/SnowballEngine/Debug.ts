import { default as cloneDeep } from 'lodash.clonedeep';
import projectConfig from '../../SnowballEngineConfig.json';

export class D {
    public static init(): void {
        window.addEventListener('error', (e: ErrorEvent) => {
            e.preventDefault();

            D.error(e.error);
        });

        window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
            e.preventDefault();

            D.error(e.reason);
        });
    }

    public static log(msg: string | number | boolean | Record<string, unknown>, logstack = false): void {
        if (!projectConfig.build.isDevelopmentBuild) return;

        const o = D.formatMessage('log', msg, logstack ? D.formatStack(Error().stack) : '');

        if (window.cordova) alert(o.join());
        else console.log(...o);
    }

    public static warn(msg: string | number | boolean | Record<string, unknown>, logstack = true): void {
        if (!projectConfig.build.isDevelopmentBuild) return;

        const o = D.formatMessage('warning', msg, logstack ? D.formatStack(Error().stack) : '');

        if (window.cordova) alert(o.join());
        else console.warn(...o);
    }

    public static error(msg: string | number | boolean | Record<string, unknown>, logstack = true): void {
        if (!projectConfig.build.isDevelopmentBuild) return;

        if (typeof msg === 'object' && 'name' in msg && 'message' in msg && 'stack' in msg) return console.warn(msg);

        const o = D.formatMessage('error', msg, logstack ? D.formatStack(Error().stack) : '');

        if (window.cordova) alert(o.join());
        else console.warn(...o);
    }

    private static formatStack(stack = ''): string {
        return D.formatStackFirefox(stack) || D.formatStackChromium(stack) || D.formatStackCordova(stack) || stack.replace(/error[:]?/i, '');
    }

    private static formatStackFirefox(stack: string): string {
        return stack.split('\n').slice(1).map(line => {
            const match = line.match(/^(.*?)@http[s]?:\/\/.*?\/(.*?):(\d+):(\d+)$/);

            return D.formatStackLine(match);
        }).filter(Boolean).join('\n');
    }

    private static formatStackChromium(stack: string): string {
        return stack.split('\n').slice(2).map(line => {
            const match = line.trim().match(/^at (.*?) \(http[s]?:\/\/.*?\/(.*?):(\d+):(\d+)\)$/);

            return D.formatStackLine(match);
        }).filter(Boolean).join('\n');
    }

    private static formatStackCordova(stack: string): string {
        return stack.split('\n').slice(2).map(line => {
            const match = line.trim().match(/^at (.*?) \(file:\/\/\/android_asset\/www\/(.*?):(\d+):(\d+)\)$/);

            return D.formatStackLine(match);
        }).filter(Boolean).join('\n');
    }

    private static formatStackLine(match: RegExpMatchArray | null): string {
        if (!match) return '';

        const info = {
            functionName: match[1],
            filePath: match[2],
            line: match[3],
            position: match[4]
        };

        if (!info.filePath || !info.functionName) return '';

        return `at ${info.functionName} (/${info.filePath}:${info.line})`;
    }

    private static formatMessage(type: 'log' | 'warning' | 'error', msg: string | number | boolean | Record<string, unknown> | (string | number | boolean | Record<string, unknown>)[], stack: string): (string | number | boolean | Record<string, unknown>)[] {
        const ret: (string | number | boolean | Record<string, unknown>)[] = [];

        if (type === 'warning') {
            ret.push(`Warning${!stack ? ': ' : ''}`);
        } else if (type === 'error') {
            ret.push(`Error${!stack ? ': ' : ''}`);
        }

        if (ret[0]) ret.push('\n');

        if (Array.isArray(msg)) ret.push(...cloneDeep(msg));
        else ret.push(cloneDeep(msg));

        if (stack) ret.push('\n\n' + stack);

        return ret;
    }
}