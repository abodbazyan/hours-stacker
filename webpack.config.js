const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        japanese: './src/japanese.js',
        korean: './src/korean.js',
        russian: './src/russian.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    watch: true
};