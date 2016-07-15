var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    minimatch = require('minimatch');

function getTestEntries() {
    let obj = {},
        test_dir = './_test/integration/';

    fs.readdirSync(test_dir).forEach(file => {
        obj[file.replace('.ts', '')] = test_dir + file;
    });
    
   return obj;
}

module.exports = {
    entry: getTestEntries(),
    output: {
        filename: "./_test/_build/integration/[name].js"
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