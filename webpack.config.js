const path = require('path');

module.exports = {
    entry: './src/SnowballEngine/Start.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules', 'src'],
        alias: {
            se: path.resolve(__dirname, 'src/SnowballEngine/SE.ts')
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    }
};