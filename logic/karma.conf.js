module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            // Unit testing
            '_test/_build/unit/*.js',

            // Integration testing
            '_test/_build/integration/*.js'
        ],
        colors: true,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true
    });
};