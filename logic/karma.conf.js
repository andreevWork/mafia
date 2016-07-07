module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            '_test/_build/**/*.js'
        ],
        preprocessors: {
            '_test/_build/**/*.js': ["babel"]
        },
        babelPreprocessor: {
            options: {
                presets: ['es2015']
            }
        },
        colors: true,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true
    });
};