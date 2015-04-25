"use strict";

export function CORDOVA_PLUGIN_TEMPLATE({pluginId, pluginVersion} = {}) {
    return `<plugin name="${pluginId}"${pluginVersion ? ` spec="${pluginVersion}"` : ``} />`;
}
export function PGBUILD_PLUGIN_TEMPLATE({pluginId, pluginVersion, pluginSource = "plugins.cordova.io"} = {}) {
    return `<gap:plugin name="${pluginId}"${pluginVersion ? ` version="${pluginVersion}"` : ``} src="${pluginSource}" />`;
}

/**
 * convert cordova.plugins in package.json into a format suitable
 * for phonegap build; should handle versions of the form of
 * com.example.plugin@0.2.3
 *
 * TODO: add repository?
 */
export function transformCordovaPlugins(template, { cordova:{plugins}} = { cordova: { plugins: [] } } ) {
    "use strict";
    if (plugins instanceof Array) {
        return plugins.map(p => {
            let [ pluginId, pluginVersion ] = p.split("@");
            return template.call(undefined, {pluginId, pluginVersion});
        }).join("\n  ");
    }
}
