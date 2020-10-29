export class ProjectSettings {
    public static allowContextMenu: boolean = false;
    public static IsDevelopmentBuild: boolean = true;
    public static get IsCordovaApp(): boolean {
        return !!window.cordova;
    }
    public static get workingDirectory(): string {
        const m = window.location.pathname.match(/(.*\/)[^\/]*/);
        if (m && m[1]) return m[1];
        else return '';
    }
}