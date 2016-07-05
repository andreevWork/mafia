module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            '_test/_build/**/*.js'
        ],
        colors: true,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true
    });
};