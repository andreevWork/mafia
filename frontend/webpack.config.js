module.exports = {
    entry: {
        room: './typescript/room.ts',
        player: './typescript/player.ts'
    },
    
    output: {
        filename: "./../server/public/js/[name].js"
    },

    resolve: {
        extensions: ["", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: "babel?presets[]=react!ts"
            }
        ]
    }
};