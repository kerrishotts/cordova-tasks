import "core-js/shim";
import {CORDOVA_ASSET_TEMPLATE, PGBUILD_ASSET_TEMPLATE, transformCordovaAssets} from "../../src/transforms/cordova-assets";

let should = require("should");

describe("cordova-assets", () => {
    describe("#no-assets", () => {
        it("should result in an empty string", () => {
            var result = transformCordovaAssets("icon", CORDOVA_ASSET_TEMPLATE);
            should(result).be.equal(``);
        })
    });
    describe("#simple-asset", () => {
        it("should result in a single, well-formed XML tag with no version attribute", () => {
            var result = transformCordovaAssets("icon", CORDOVA_ASSET_TEMPLATE, {
                cordova: {
                    platforms: ["ios"],
                    icon: {
                        ios: [
                            { src:"path/to/image.png", w:650, h:300}
                        ]
                    }
                }
            });
            should(result).be.equal(`<icon src="path/to/image.png" platform="ios" width="650" height="300" />`);
        })
    });
});

