export class D {
    public static log(msg: any, logstack: boolean = false) {
        if (!project.settings.isDevelopmentBuild) return;

        const o = D.formatMessage('log', msg, logstack ? D.formatStack(Error().stack) : '');

        if (window.cordova) alert(o);
        else console.log(o);
    }
    public static warn(msg: any, logstack: boolean = true) {
        if (!project.settings.isDevelopmentBuild) return;

        const o = D.formatMessage('warning', msg, logstack ? D.formatStack(Error().stack) : '');

        if (window.cordova) alert(o);
        else console.warn(o);
    }
    public static error(msg: any, logstack: boolean = true) {
        if (!project.settings.isDevelopmentBuild) return;

        const o = D.formatMessage('error', msg, logstack ? D.formatStack(Error().stack) : '');

        if (window.cordova) alert(o);
        else console.warn(o);
    }
    private static formatStack(stack: string = ''): string {
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
    private static formatMessage(type: 'log' | 'warning' | 'error', msg: string, stack: string) {
        let fmsg = '';

        if (type === 'warning') {
            fmsg += 'Warning';
            if (!stack) fmsg += ': ';
        } else if (type === 'error') {
            fmsg += 'Error';
            if (!stack) fmsg += ': ';
        }

        if (!stack) fmsg += msg;
        else {
            fmsg += '\n' + msg;
            fmsg += '\n\n' + stack;
        }

        return fmsg;
    }
}