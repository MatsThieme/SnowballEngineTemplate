const { resolve } = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [new ESLintPlugin()],
    resolve: {
        extensions: [".ts", ".js"],
        modules: ["node_modules", "src"],
    },
    output: {
        path: resolve("dist"),
        filename: "index.js",

        library: {
            name: "snowballengine",
            type: "umd",
        },
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
    mode: "development",
    devtool: "source-map",
};
