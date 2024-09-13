const path = require('path');

module.exports = {
    entry: './src/index.ts',
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
        extensions: ['.ts', '.js'],  //this might be irrelevant now
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'), //github pages only accepts docs as the non root folder unless you use github acton to deploy???
    },
    mode: 'development',
};
