export function CORDOVA_ASSET_TEMPLATE(assetType, platform, {src, d, w, h} = {}) {
    return `<${assetType} src="${src}" platform="${platform}"${d?` density="${d}"`:``}${w?` width="${w}"`:``}${h?` height="${h}"`:``} />`;
}
export function PGBUILD_ASSET_TEMPLATE(assetType, platform, {src, d, w, h} = {}) {
    return `<${assetType} src="${src}" gap:platform="${platform}"${d?` gap:qualifier="${d}"`:``}${w?` width="${w}"`:``}${h?` height="${h}"`:``} />`;
}

/**
 * Create a list of icons or splash screens
 * @param assetType {string} icon | splash
 * @param assetTemplate {function}     one of the above templates
 * @param cordova {*}
 */
export function transformCordovaAssets(assetType, assetTemplate, {cordova} = {cordova: {platforms: [], assets: {}}} ) {
    let {platforms} = cordova,
        assets = cordova[assetType];
    if (platforms instanceof Array && assets instanceof Object) {
        return platforms.map( platform => {
            let assetList = assets[platform];
            if (assetList instanceof Array) {
                return assetList.map(assetTemplate.bind(undefined, assetType, platform)).join("\n  ");
            } else {
                return "";
            }
        }).join("\n  ");
    } else {
        return "";
    }
}

