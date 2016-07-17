module.exports = {
    entry: './src/server/GameServer.ts',
    output: {
        filename: "./src/server/GameServer.js",
        libraryTarget: 'commonjs2'
    },

    resolve: {
        extensions: ["", ".ts", ".js"]
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: "ts"
            }
        ]
    }
};