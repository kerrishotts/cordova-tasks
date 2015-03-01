/**
 * convert cordova.preferences in package.json into a format
 * suitable for config.xml
 */
export function transformCordovaPrefs({cordova: { preferences }} = {cordova: {preferences: {}}}) {
    "use strict";
    if (preferences instanceof Object) {
        return Object.entries(preferences).map(
            ([k, v]) => `<preference name="${k}" value="${v}" />`
        ).join("\n  ");
    }
}
