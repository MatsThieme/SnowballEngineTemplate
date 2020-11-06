/**
 *
 * SnowballEngineConfig.json values
 *
 */
declare const project: {
    readonly title: string,
    readonly description: string,
    readonly version: string,
    readonly settings: {
        readonly allowContextMenu: boolean,
        readonly IsDevelopmentBuild: boolean
    },
    readonly "cordova-settings": {
        readonly id: string,
        readonly author: {
            readonly name: string,
            readonly email: string,
            readonly href: string
        },
        readonly Fullscreen: boolean,
        readonly Orientation: 'default' | 'landscape' | 'portrait',
        readonly EnableWebGL: boolean,
        readonly KeepRunning: boolean,
        readonly plugins: ReadonlyArray<string>
    }
};