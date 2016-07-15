module.exports = {
    entry: './src/websocket/WebSocketServer.ts',
    output: {
        filename: "./src/websocket/WebSocketServer.js",
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