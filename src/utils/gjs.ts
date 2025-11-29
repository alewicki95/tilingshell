import { GObject } from '../gi/ext';

// Modified from https://github.com/material-shell/material-shell/blob/main/src/utils/gjs.ts
// Decorator function to call `GObject.registerClass` with the given class.
// Use like
// ```
// @registerGObjectClass
// export class MyThing extends GObject.Object { ... }
// ```
export function registerGObjectClass<
    K,
    T extends { metaInfo?: any; new (..._params: any[]): K },
>(target: T) {
    // Use only the class's own metaInfo (not inherited)
    const metaInfo = Object.prototype.hasOwnProperty.call(target, 'metaInfo')
        ? { ...target.metaInfo }
        : {};

    // Always ensure a unique GTypeName
    if (!metaInfo.GTypeName) {
        // Prefix with something project-specific to avoid cross-extension conflicts
        metaInfo.GTypeName = `TilingShell${target.name}`;
    }

    // @ts-expect-error This is expected
    return GObject.registerClass<K, T>(metaInfo, target) as typeof target;
}
