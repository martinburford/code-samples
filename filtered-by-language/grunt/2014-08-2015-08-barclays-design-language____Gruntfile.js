var pkg = bdlf = {};
var grunt = require('grunt');
var inquirer = require('inquirer');

module.exports = function(grunt){
  'use strict';

  // Load in custom functions, for use throughout the build task(s)
  bdlf = require('./grunt-helpers.js')(grunt);

  // Load all packages which begin with 'grunt-'
  require('load-grunt-tasks')(grunt);

  // Force timers to be output for each task
  require('time-grunt')(grunt);

  // Load the tasks from the /tasks/ sub-directory
  grunt.loadTasks('tasks');

  // Turn logging on if --log was provided as an argument within the Grunt command line
  if(grunt.option('log')){
    bdlf.options.logging = true;
  }

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    settings: grunt.file.readJSON('settings.json')
  };
  
  // Load the node module options from their respective configuration file within tasks/options sub-directory
  grunt.util._.extend(config,bdlf.loadConfig('./tasks/options/'));
  grunt.initConfig(config);

  // Before running any task, initialize any necessary logic for the Grunt tasks to run successfully
  grunt.task.run('wait:bootstrap');


  // Default task to run, with prompting enabled
  grunt.registerTask('default','Prompting for reaching available alias tasks',function(){
    // Run prompting in async mode, so that tasks aren't loaded until selected by the user
    var done = this.async();
    
    var taskQuestions = [{
      type: 'list',
      name: 'taskType',
      message: 'Which task do you want to run?',
      choices: [
        'styleguide',
        'watchFiles'
      ]
    }];

    // Provide a prompt on-screen, to the user, in order to provide a choice of tasks to run
    inquirer.prompt(taskQuestions,function(answers){
      // Load the task that the user selected
      grunt.task.run(answers.taskType);

      // Resume synchronous processing
      done();
    });
  });

  // Available task aliases
  grunt.task.registerTask('concatAlias',[
    'concatJavascriptLibraries'
  ]);

  grunt.task.registerTask('copyAlias',[
    'copyFiles:00globals',
    'copyFiles:01elements',
    'copyFiles:02patterns',
    'copyFiles:03templates',
    'copyFiles:04pages',
    'copyFiles:ajax',
    'copyFiles:globalImages',
    'copyFiles:includeFiles',
    'copyFiles:javascript',
    'copyFiles:javascriptLibraries',
    'copyNotesImages:00globals',
    'copyNotesImages:01elements',
    'copyNotesImages:02patterns',
    'copyNotesImages:04pages',
    'copyStaticAssets' // Export available
  ]);

  grunt.task.registerTask('markdownAlias',[
    'processMarkdown:00globals',
    'processMarkdown:01elements',
    'processMarkdown:02patterns',
    'processMarkdown:04pages'
  ]);

  grunt.task.registerTask('renameAlias',[
    'renameTask'
  ]);

  grunt.task.registerTask('sassAlias',[
    'gridCss', // Export available
    'portalCss',
    'siteCss'
  ]);

  grunt.task.registerTask('templateAlias',[
    'processModuleTemplate', // Needs to run before the generatePages task(s)
    'generatePages:00globals',
    'generatePages:01elements',
    'generatePages:02patterns',
    'generateExamplePages:04pages',
    'generateBuildingBlocks'
  ]);

  grunt.task.registerTask('uglifyAlias',[
    'uglifyJavascriptFiles'
  ]);

  grunt.task.registerTask('utilitiesAlias',[
    'createLogFile'
  ]);

  /**
  * The main styleguide task, which will initiate the necessary tasks
  * @task styleguide
  * @param {STRING} environment The environment which the site is being built for
  */
  grunt.registerTask('styleguide','The main styleguide task, which will initiate the necessary tasks',function(environment){
    var taskName = grunt.task.current.name;
    var logPrefix = '[' + taskName + ']: ';
    bdlf.log.taskEntry(logPrefix + 'environment=' + environment);

    // If an environment has been provided, override the configuration settings to be those specific to the provided environment
    if(bdlf.options.environmentSettings.hasOwnProperty(environment)){
      bdlf.options.environmentSettings.toUse = bdlf.options.environmentSettings[environment];
      
      bdlf.log.message(logPrefix.bdlf + 'updated configurations to the environment of: ' + environment);
    }

    // If compact footer scripts are to be built, run the additional concat and uglify tasks
    if(bdlf.options.environmentSettings.toUse.compactFooterScripts){
      bdlf.options.environmentSettings.toUse.tasks.push('concatAlias');
      bdlf.options.environmentSettings.toUse.tasks.push('uglifyAlias');
    }

    bdlf.log.message(logPrefix.bdlf + 'environment settings are set to: ');
    bdlf.log.logObject(bdlf.options.environmentSettings.toUse);

    // Load the necessary tasks, to perform the site build
    grunt.task.run('processTaskQueue');
  });

  /**
  * The main release task: versions the current code, increase the version, and build the styleguide.
  * @task release
  */
  grunt.registerTask('release','The main release task: versions the current code, increase the version, and build the styleguide.',function(){
    grunt.task.run('versioning');
    grunt.task.run('styleguide:release');
  });

};