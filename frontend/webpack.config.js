module.exports = {
    entry: {
        index: './typescript/index.ts',
        room: './typescript/room.ts',
        player: './typescript/player.ts'
    },
    
    output: {
        filename: "./../server/public/js/[name].js"
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