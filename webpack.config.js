const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './src/SnowballEngine/Start.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules', 'src'],
        alias: {
            SE: resolve(__dirname, 'src/SnowballEngine/SnowballEngine.ts'),
            Config: resolve(__dirname, 'SnowballEngineConfig.json'),
            UI: resolve(__dirname, 'src/SnowballEngine/UI/'),
            Utility: resolve(__dirname, 'src/SnowballEngine/Utilities/'),
            Input: resolve(__dirname, 'src/SnowballEngine/Input/'),
            Assets: resolve(__dirname, 'src/SnowballEngine/Assets/'),
            Audio: resolve(__dirname, 'src/SnowballEngine/Audio/'),
            GameObject: resolve(__dirname, 'src/SnowballEngine/GameObject/')
        }
    },
    output: {
        path: resolve('dist')
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false
                    }
                },
                extractComments: false
            })
        ]
    }
};