const esBuild = require("esbuild");

function bundleFile(src, { dist, minify = false, type = null } = {}) {
    let outfile = dist ? `./dist/${dist}` : `./dist/${src}`;
    let config = {};

    switch (type) {
        case "modulejs":
        case "mjs":
            config = { platform: "neutral", mainFields: ["module", "main"] };
            break;

        case "commonjs":
        case "cjs":
            outfile = outfile.replace(".js", ".cjs");
            config = { platform: "node", target: ["node10.4"] };
            break;

        default:
            config = { platform: "browser" };
            break;
    }

    esBuild.build({
        entryPoints: [`./src/${src}`],
        outfile,
        bundle: true,
        ...config,
    });

    if (minify) {
        esBuild.build({
            entryPoints: [`./src/${src}`],
            outfile: outfile.replace(".js", ".min.js"),
            bundle: true,
            minify: true,
            ...config,
        });
    }
}

// Default (class) build
bundleFile("index.js", { type: "mjs" });
bundleFile("index.js", { type: "cjs" });

// Custom Element Build
bundleFile("custom-element/module.js", {
    dist: "custom-element/index.js",
    type: "mjs",
});
bundleFile("custom-element/module.js", {
    dist: "custom-element/index.js",
    type: "cjs",
});
bundleFile("custom-element/cdn.js", { minify: true });

// Alpine Build
bundleFile("alpine/module.js", { dist: "alpine/index.js", type: "mjs" });
bundleFile("alpine/module.js", { dist: "alpine/index.js", type: "cjs" });
bundleFile("alpine/cdn.js", { minify: true });
