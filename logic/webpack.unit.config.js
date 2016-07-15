var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    minimatch = require('minimatch');

function getTestEntries() {
    var test_dir_initial = './_test',
        current_dir = test_dir_initial,
        multiply_entries = {},
        test_name_reg = /\/(\w+Test)/i,
        entries = fs.readdirSync(test_dir_initial),
        prev_dir = [], test_name;

    _.flatten(entries.map(getFilesRecursive))
        .filter(minimatch.filter('**/*Test.ts'))
        .forEach(path => {
            test_name = path.match(test_name_reg);
            test_name = test_name[test_name.length - 1];
            
            // Записываем в объект с точками входа по имени тестового файла, его относительный путь
            multiply_entries[test_name] = './' + path;
        });

    // console.log(multiply_entries);

    return multiply_entries;
    
    function getFilesRecursive(dir) {
        var stat =  fs.statSync(path.join(current_dir, dir)),
            entries;

        // Если не директория, значит файл, просто возвращаем
        if(!stat.isDirectory()) return path.join(current_dir, dir);
        
        // Запоминаем текущую директорию
        prev_dir.push(current_dir);
        // Текущую директорию соединяем с переданной для того, чтобы использовать дальше в рекурсии
        current_dir = path.join(current_dir, dir);
        
        entries = fs.readdirSync(current_dir).map(getFilesRecursive);
        
        // Восстанавливаем текущую директорию, после возвращения из рекурсии
        current_dir = prev_dir.pop();

        return entries;

    }
}

module.exports = {
    entry: getTestEntries(),
    output: {
        filename: "./_test/_build/unit/[name].js"
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