/**
 * convert cordova.plugins in package.json into a format suitable
 * for phonegap build; should handle versions of the form of
 * com.example.plugin@0.2.3
 *
 * TODO: add repository?
 */
export function transformCordovaPlugins({ cordova:{plugins}} = { cordova: { plugins: [] } } ) {
    "use strict";
    if (plugins instanceof Array) {
        return plugins.map(p => {
            let [ pluginId, pluginVersion ] = p.split("@");
            return `<gap:plugin name="${pluginId}"${pluginVersion ? ` version="${pluginVersion}"` : ``} src="plugins.cordova.io" />`;
        }).join("\n  ");
    }
}
