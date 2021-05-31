const path = require('path');
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
            SE: path.resolve(__dirname, 'src/SnowballEngine/SnowballEngine.ts'),
            Config: path.resolve(__dirname, 'SnowballEngineConfig.json'),
            UI: path.resolve(__dirname, 'src/SnowballEngine/UI/'),
            Utility: path.resolve(__dirname, 'src/SnowballEngine/Utilities/'),
            Input: path.resolve(__dirname, 'src/SnowballEngine/Input/'),
            Assets: path.resolve(__dirname, 'src/SnowballEngine/Assets/'),
            Audio: path.resolve(__dirname, 'src/SnowballEngine/Audio/'),
            GameObject: path.resolve(__dirname, 'src/SnowballEngine/GameObject/')
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false
                    },
                },
                extractComments: false
            })
        ]
    }
};