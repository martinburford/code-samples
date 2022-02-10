var colors = require('colors');
var glob = require('glob');
var fse = require('fs-extra');
var objectMerge = require('object-merge');
var stripAnsi = require('strip-ansi');
var prettify = require('html');

// Define the colour palette globally, for use across all Grunt task .js files
colors.setTheme({
  bdlf: 'cyan',
  error: 'red',
  success: 'green',
  task: 'yellow',
  warning: 'yellow'
});

/**
* Any prototype extensions
*/
Number.prototype.leadingZeros = function(base,character){
  var length = (String(base || 10).length - String(this).length)+1;
  return length > 0 ? new Array(length).join(character || '0') + this : this;
}

module.exports = function(grunt){
  var options = {
    buildingBlocksData: null,
    environmentSettings: {
      export: {
        tasks: [
          'export'
        ]
      },
      release: {
        compactFooterScripts: true,
        logging: false,
        tasks: [
          'copyAlias',
          'markdownAlias',
          'sassAlias',
          'templateAlias',
          'utilitiesAlias',
          'currentVersionZip',
          'generatePortalStaticPages',
          'listPage'
        ]
      },
      toUse: {
        compactFooterScripts: false,
        logging: true,
        tasks: [
          'copyAlias',
          'markdownAlias',
          'sassAlias',
          'templateAlias',
          'utilitiesAlias',
          'versioning',
          'currentVersionZip',
          'generatePortalStaticPages',
          'listPage'
        ]
      }
    },
    logFileData: [], // Array to push content onto as log messages are sent to the console
    portalStaticPages: {
      templateData: {},
      files: []
    }, 
    prettify: {
      indentCharacter: ' ',
      indentSize: 4,
      maxChar: 999,
      unformatted: []
    },
    regExPatterns: {
      acceptedModuleName: /^[a-z]/i,
      isHiddenFile: /^[^\.]/,
      isMdFile: /.md$/,
      portalLinkPage: /\[\[linkPage=\'(.*?)\'\]\]/g,
      portalThumbnailList: /\[\[thumbnailList=\'(.*?)\'\]\]/g,
      removeFileExtension: /\..*$/,
      newLineWithSpaces: /\n */g,
      numericStart: /^\d+/,
      underscore: /_/g
    },
    templates: {},
    testKey: 'testValue',
    modules: {}
  };

  var log = {
    /**
    * Print out a log message to the screen
    * @function taskEntry
    * @param {STRING} message The log message to send to the screen
    * @param {OBJECT} obj An object to log the contents of
    */
    taskEntry: function(message,obj){
      var objContents = typeof(obj) === 'object' ? '{' + objectToString(obj) + '}' : '';
      var taskTitle = message.toUpperCase();

      if(bdlf.options.environmentSettings.toUse.logging){
        console.log('\n******** '.task + taskTitle.task + objContents.task + ' ********\n'.task);

        // Save log data, so it can be output in a log file
        bdlf.options.logFileData.push({
          type: 'taskEntry',
          message: stripAnsi(message)
        });
      }
    },

    /**
    * Print out a log message to the screen
    * @function message
    * @param {STRING} message The log message to send to the screen
    * @param {OBJECT} obj An object to log the contents of
    */
    message: function(message,obj){
      var objContents = typeof(obj) === 'object' ? '{' + objectToString(obj) + '}' : '';

      if(bdlf.options.environmentSettings.toUse.logging){
        console.log('> ' + message + objContents);

        // Save log data, so it can be output in a log file
        bdlf.options.logFileData.push({
          type: 'message',
          message: stripAnsi(message)
        });
      }
    },

    /**
    * Print out an object in its raw format
    * @function logObject
    * @param {STRING} obj The object to print out to the console
    */
    logObject: function(obj){
      if(bdlf.options.environmentSettings.toUse.logging){
        console.log(obj);
      }
    },

    /**
    * Print out a log message to the screen
    * @function error
    * @param {STRING} message The log message to send to the screen
    * @param {OBJECT} obj An object to log the contents of
    */
    error: function(message,obj){
      var objContents = typeof(obj) === 'object' ? '{' + objectToString(obj) + '}' : '';

      if(bdlf.options.environmentSettings.toUse.logging){
        console.log('> ' + message.error + objContents.white);

        // Save log data, so it can be output in a log file
        bdlf.options.logFileData.push({
          type: 'error',
          message: stripAnsi(message)
        });
      }
    },

    /**
    * Print out a log message to the screen
    * @function success
    * @param {STRING} message The log message to send to the screen
    * @param {OBJECT} obj An object to log the contents of
    */
    success: function(message,obj){
      var objContents = typeof(obj) === 'object' ? '{' + objectToString(obj) + '}' : '';

      if(bdlf.options.environmentSettings.toUse.logging){
        console.log('* '.success + message.success + objContents.success);

        // Save log data, so it can be output in a log file
        bdlf.options.logFileData.push({
          type: 'success',
          message: stripAnsi(message)
        });
      }
    },

    /**
    * Print out a log message to the screen
    * @function warning
    * @param {STRING} message The log message to send to the screen
    * @param {OBJECT} obj An object to log the contents of
    */
    warning: function(message,obj){
      var objContents = typeof(obj) === 'object' ? '{' + objectToString(obj) + '}' : '';

      if(bdlf.options.environmentSettings.toUse.logging){
        console.log('* '.warning + message.warning + objContents.warning);

        // Save log data, so it can be output in a log file
        bdlf.options.logFileData.push({
          type: 'warning',
          message: stripAnsi(message)
        });
      }
    },    
  };

  var templating = {
    /**
    * Generate the banner comments for the top of the relevant (compiled) CSS file
    * @function bannerComments
    * @return {STRING} banner.grid The comment to prefix to the top of the grid (compiled) CSS file
    * @return {STRING} banner.gridIe The comment to prefix to the top of the IE grid (compiled) CSS file
    */
    bannerComments: function(){
      var functionName = 'bdlf.templating.bannerComments';
      var logPrefix = '[' + functionName + ']: ';

      var banner = {
        grid: '',
        gridIe: ''
      };
      var settings = grunt.config['data'].settings;

      // Create the banner for the grid (compiled) CSS file
      var gridFilesList = settings.gridFiles.split(',');

      for(var i=0; i<gridFilesList.length; i++){
        banner.grid += grunt.file.read(settings.paths.globals + '/grid/scss/' + gridFilesList[i] + '.scss').split('\n')[0];

        if(i < gridFilesList.length){
          banner.grid += '\n';
        }
      }

      // Create the banner for the gridIe (compiled) CSS file
      var gridIeFilesList = settings.gridFilesIe.split(',');

      for(var i=0; i<gridIeFilesList.length; i++){
        banner.gridIe += grunt.file.read(settings.paths.globals + '/grid/scss/' + gridIeFilesList[i] + '.scss').split('\n')[0];

        if(i < gridIeFilesList.length){
          banner.gridIe += '\n';
        }
      }

      bdlf.log.message(logPrefix.bdlf + 'Grid banner:\n\n' + banner.grid);
      bdlf.log.message(logPrefix.bdlf + 'Grid bannerIe:\n\n' + banner.gridIe);

      return banner;
    },

    /**
    * Process include directives into their compiled HTML snippets, merging with the appropriate JSON data
    * @function processTemplateIncludeDirectives
    * @param {STRING} fileText The html code of the .tpl template file
    * @return {STRING} The html code of the .tpl file, but with include directives processed
    */
    processTemplateIncludeDirectives: function(fileText){
      var functionName = 'bdlf.templating.processTemplateIncludeDirectives';
      var logPrefix = '[' + functionName + ']: ';
      // bdlf.log.message(logPrefix.bdlf + 'fileText=' + fileText);

      var settings = grunt.config['data'].settings;
      var recursionCounter = 0;

      while(fileText.match(settings.convertedRegularExpressions.templateIncludeRegEx) && (recursionCounter < settings.templateMaximumRecursion)){
        recursionCounter++;

        // Create a list of all template include matches
        var matchedIncludes = fileText.match(settings.convertedRegularExpressions.templateIncludeRegEx);
        var includesCounter;
        var currentInclude;
        var templateFileName;
        var fileName;
        var dataForTemplate;

        for(includesCounter=0; includesCounter<=matchedIncludes.length-1; includesCounter++){
          currentInclude = matchedIncludes[includesCounter];

          // Retrieve the template filename from the template include directive
          templateFileName = currentInclude.replace(settings.convertedRegularExpressions.templateIncludeRegEx,settings.regularExpressions.templateIncludeReplace);

          fileName = settings.source + '/' + templateFileName;
          dataForTemplate = {};

          // Check to see if there is a data attribute in the include directive
          if(currentInclude.match(settings.convertedRegularExpressions.templateDataRegEx)){
            // Get the contents of the data attribute
            dataForTemplate = currentInclude.replace(settings.convertedRegularExpressions.templateDataRegEx,settings.regularExpressions.templateDataReplace);

            // If data is JSON, parse it
            if(dataForTemplate.indexOf('{') != -1){
              dataForTemplate = JSON.parse(dataForTemplate);
            }
            // Check for local JSON file
            else if(fse.existsSync(dataForTemplate)){
              dataForTemplate = grunt.file.readJSON(dataForTemplate);
            }
            // Check for named .json file in templates directory
            else if(fse.existsSync(settings.source + '/' + dataForTemplate)){
              dataForTemplate = grunt.file.readJSON(settings.source + '/' + dataForTemplate);
            }
          }
          // A straight file include (such as header and footer)
          else{
            var dataPath = fileName.replace(settings.convertedRegularExpressions.templateFileRegEx,settings.templateDataFileExtension);

            if(fse.existsSync(dataPath)){
              // Check for the filename.json in the templates folder (that matches the corresponding template name)
              dataForTemplate = grunt.file.readJSON(dataPath);
            }
          }

          // Pass the processed template back in the place of the template include directive
          fileText = fileText.replace(currentInclude,bdlf.templating.processTemplate(fileName,dataForTemplate));
        }
       }

       return fileText;
    },

    /**
    * Process a snippet of HTML against the modules corresponding JSON data
    * @function processTemplate
    * @param {STRING} fileName The path to the include directives source
    * @param {OBJECT} dataForTemplate The data to send to the template for processing
    * @return {STRING} processedHtml The module snippet of pre-compiled code having been processed against its corresponding data
    */
    processTemplate: function(fileName,dataForTemplate){
      var htmlCodePreProcessed = grunt.file.read(fileName);
      var processedHtml = grunt.template.process(htmlCodePreProcessed,{
        'data':{
          'template': dataForTemplate
        }
      });

      return processedHtml;
    },

    /**
    * Generate a string of HTML attributes based on an object
    * SAMPLE: {"class":"class-list here"} = ' class="class-list here"'
    * @function attachHtmlAttributes
    * @param {STRING} attributes The attributes in delineated string format
    */
    attachHtmlAttributes: function(attributes){
      var attributes = attributes || {};
      var attributeOutput = '';
      var attribute;

      for(attribute in attributes){
        var value = attributes[attribute];

        if(value.indexOf('xxx')>-1) value = value.replace('xxx',bdlf.templating.idIncrementor());
        if(value.indexOf('yyy')>-1) value = value.replace('yyy',bdlf.templating.getId());

        attributeOutput += ' ' + attribute + '="' + value + '"';
      }

      return attributeOutput;
    },

    /**
    * Increment a globally stored incrementor value within the Grunt settings file
    * @function idIncrementor
    * @return {INTEGER} The centrally stored id value incremented by 1
    */
    idIncrementor: function(){
      var settings = grunt.config['data'].settings;
      var incrementor = settings.idCounterNew++;
      
      return incrementor;
    },

    /**
    * Retrieve the highest element Id counter value from Grunts global settings storage
    * @function getIdAc
    * @return {INTEGER} The highest element Id counter value
    */
    getId: function(){
      var settings = grunt.config['data'].settings;

      return settings.idCounterNew;
    },

    /**
    * Merge the template data object into the required data object
    * @function mergeTemplateAndRequiredData
    * @return {OBJECT} The merged object
    */
    mergeTemplateAndRequiredData: function(){
      var obj = {};
      var src;
      var i;
      var args = [].splice.call(arguments,0);

      while(args.length > 0){
        src = args.splice(0,1)[0];

        if(toString.call(src) == '[object Object]'){
          for(i in src){
            if(src.hasOwnProperty(i)){
              if(toString.call(src[i]) == '[object Object]'){
                obj[i] = bdlf.templating.mergeTemplateAndRequiredData(obj[i] || {}, src[i]);
              }
              else{
                // When processing the last (required) object
                if(args.length === 0){
                  // ...and it is a class
                  if(i == 'class'){
                    obj[i] = ((obj[i] ? obj[i] + ' ' : '') + src[i]).trim();
                  }
                  else{
                    obj[i] = src[i];
                  }
                }
                else{
                  obj[i] = src[i];
                }
              }
            }
          }
        }
      }

      return obj;
    },

    /**
    * Construct necessary data for templating
    * @function buildData
    * @param {OBJECT} fallback Fallback data object
    * @param {OBJECT} data Default data object
    * @param {OBJECT} required Required data object
    * @return {OBJECT} All 3 data objects merged
    */
    buildData: function(fallback,data,required){
      var fallback = fallback || {};
      var data = data || {};
      var required = required || {};

      // Merge (recursively) the fallback data and the template data objects
      var obj = objectMerge(fallback,data);

      // Merge (recursively) the template data and the required data, ensuring that classnames are appended, not replaced
      obj = bdlf.templating.mergeTemplateAndRequiredData(obj,required);

      return obj;
    },

    /**
    * Generate dynamic labels/legends (for the Styleguide) when no label/legend is provided
    * @function dynamicLabel
    * @return {STRING} Dynamically generated label text
    */
    dynamicLabel: function(){
      var settings = grunt.config['data'].settings;
      var outputLabel = '';
      var localLabel = settings.dynamicLabel.split(' ');
      var labelWords = Math.floor(Math.random() * localLabel.length);
      var randomWord = 0;

      // Generate dynamic labels
      var i;
      for(i=0; i<labelWords+1; i++){
        randomWord = Math.floor(Math.random() * localLabel.length);
        outputLabel += localLabel[randomWord];

        if(i !== labelWords){
          outputLabel += ' ';
        }
      }

      outputLabel = outputLabel.charAt(0).toUpperCase() + outputLabel.substring(1);

      return outputLabel;   
    },

    /**
    * Generate dynamic paragraphs (for the Styleguide)
    * @function dynamicParagraph
    * @param {INTEGER} sentences The number of sentences that the returned string should consist of
    * @return {STRING} The number of sentences requested, randomly generated, and concatenated together
    */
    dynamicParagraph: function(sentences){
      var settings = grunt.config['data'].settings;
      var provideAllParagraphs = sentences === undefined;
      var output;

      if(provideAllParagraphs){
        output = settings.dynamicParagraph;
      }
      else{
        var sentenceIndexes = []; 
        var arrParagraph = settings.dynamicParagraph.split('.');
        var randomPosition;
        var outputSentences = '';

        // Remove trailing full-stop from being added into the array
        arrParagraph.pop();

        var i;
        for(i=0; i<=sentences-1; i++){
          randomPosition = Math.floor((Math.random() * arrParagraph.length-1) + 1);

          // Ensure that a preceding space is added before the first element, so long as it isn't the first element in the returned string
          sentenceIndexes.push((randomPosition === 0 && i > 0 ? ' ' : '') + arrParagraph[randomPosition]);

          // With the sentence added, remove it from the randomized array
          arrParagraph.splice(randomPosition,1);
        }

        output = sentenceIndexes.join('.') + '.';
      }

      return output;
    },

    /**
    * Retrieve all available archives
    * @function retrieveArchives
    */
    retrieveArchives: function(){
      var functionName = '[bdlf.templating.retrieveArchives]';
      var logPrefix = '[' + functionName + ']: ';
      bdlf.log.message(functionName.bdlf);

      var settings = grunt.config['data'].settings;
      var directoryToRetrieve = settings.paths.styleguide.archiveDownloads;

      // Create the folder for archiving (if it doesn't already exist)
      fse.ensureDirSync(directoryToRetrieve);

      var directoryToRetrieveExistence = fse.lstatSync(directoryToRetrieve);
      var archivesAvailable = [];

      // Loop through the directory if it exists within the file system
      for(var i=0; i<fse.readdirSync(directoryToRetrieve).length; i++){
        archivesAvailable.push(fse.readdirSync(directoryToRetrieve)[i]);
      }

      return archivesAvailable;
    },

    /**
    * Filter building block data based on a specific-complexity type
    * @function buildingBlocksComplexityFilter
    * @param {STRING} complexity The complexity eg: Element, Pattern
    * @return {ARRAY} The list of modules which match the provided complexity
    */
    buildingBlocksComplexityFilter: function(complexity){
      var functionName = 'bdlf.templating.buildingBlocksComplexityFilter';
      var logPrefix = '[' + functionName + ']: ';
      bdlf.log.message(logPrefix.bdlf + 'complexity=' + complexity);

      var settings = grunt.config['data'].settings;
      var buildingBlocks = bdlf.options.buildingBlocksData;
      var output = [];
      var module;
      var pagesLength;
      var i;
      var block;

      for(block in buildingBlocks){
        pagesLength = buildingBlocks[block].pages.length;

        for(i=0; i<pagesLength; i++){
          module = Object.keys(buildingBlocks[block].pages[i]);

          if(buildingBlocks[block].pages[i][module].complexity === complexity){
            output.push(module.toString());
          }
        }
      }

      // Remove duplicates from an array
      output = bdlf.removeArrayDuplicates(output);

      return output;
    },

    /**
    * Attach friendlyNames to each modules array
    * @function attachFriendlyNames
    * @param {OBJECT} obj The source object to be extended
    * @return {OBJECT} The extended object, inclusive of friendlyNames
    */
    attachFriendlyNames: function(obj){
      var functionName = 'bdlf.templating.attachFriendlyNames';
      var logPrefix = '[' + functionName + ']: ';
      bdlf.log.message(logPrefix.bdlf + 'obj=' + obj);

      var thumbnailsDataObj = obj;
      var groupModulesObj;
      var newModulesArr;

      // Loop through the root-level keys, to find the modules, per group
      Object.keys(obj).forEach(function(key){
        groupModulesObj = obj[key];

        // Ensure the newly created array is reset for each key (group)
        newModulesArr = [];

        for(var i=0; i<groupModulesObj.modules.length; i++){
          var newModuleObj = {};
          newModuleObj[groupModulesObj.modules[i]] = bdlf.options.moduleFriendlyNames[groupModulesObj.modules[i]];

          newModulesArr.push(newModuleObj);
        }

        // Update the modules property of the originating data object, passing in the extended data (now including Friendly Name)
        thumbnailsDataObj[key].modules = newModulesArr;
      });

      return thumbnailsDataObj;
    },

    /**
    * Replace [[linkPage=' ... ']] link regEx placeholders within static portalpages
    * @function replaceUrlPlaceholders
    * @param {STRING} fileText The HTML code of the static HTML page
    * @param {OBJECT} dataObj The data mapping of placeholder UIDs to related/associated URLs
    * @return {STRING} The HTML code, with all replacements made
    */
    replaceUrlPlaceholders: function(fileText,dataObj){
      var regEx = bdlf.options.regExPatterns.portalLinkPage; 
      var outputHtml = fileText;

      if(fileText.match(regEx)){
        var linkUrlsCounter;
        var currentLinkReplacement;
        var urlPropertyName;
        var pageUrlFromData = '';

        // Create a list of all [[ ... ]] url matches
        var matchedLinkUrls = fileText.match(regEx);

        for(linkUrlsCounter=0; linkUrlsCounter<=matchedLinkUrls.length-1; linkUrlsCounter++){
          currentLinkReplacement = matchedLinkUrls[linkUrlsCounter];
          urlPropertyName = currentLinkReplacement.substring(12,currentLinkReplacement.length-3);
          pageUrlFromData = urlPropertyName.split('.').reduce(bdlf.templating.parseJSONFromStringLiteral,dataObj);

          outputHtml = outputHtml.replace('[[linkPage=\'' + urlPropertyName + '\']]',pageUrlFromData);
        }
      }

      return outputHtml;
    },

    /**
    * Replace '[[thumbnailList=' ... ']] link regEx placeholders within static portalpages
    * @function replaceThumbnailPlaceholders
    * @param {STRING} fileText The HTML code of the static HTML page
    * @return {STRING} The HTML code, with all replacements made
    */
    replaceThumbnailListPlaceholders: function(fileText){
      var regEx = bdlf.options.regExPatterns.portalThumbnailList;
      var outputHtml = fileText;

      if(fileText.match(regEx)){
        var thumbnailsCounter;
        var thumbnailsListCounter;
        var thumbnailsToProcessArr;
        var thumbnailMarkup;
        var friendlyName;
        var techName;
        var settings = grunt.config['data'].settings;
        var templatePath = settings.paths.templates + '/';
        var templateFragmentPath = templatePath + settings.fragments.pageFragments + '/';
        var thumbnailTemplate = grunt.file.read(templateFragmentPath + 'thumbnail.html.tpl');

        // Create an array, populated with the list of thumbnails to generate HTML code for
        var matchedThumbnailLists = fileText.match(regEx);

        // Loop through each instance of [[thumbnailList=' ... ']] within the provided HTML
        for(thumbnailsListCounter=0; thumbnailsListCounter<=matchedThumbnailLists.length-1; thumbnailsListCounter++){
          thumbnailsToProcessArr = matchedThumbnailLists[thumbnailsListCounter].replace('[[thumbnailList=\'','').replace('\']]','').split(',');
          thumbnailMarkup = '';

          // Loop through all thumbnails listed within each [[thumbnailList=' ... ']] match in the provided HTML
          for(thumbnailsCounter=0; thumbnailsCounter<=thumbnailsToProcessArr.length-1; thumbnailsCounter++){
            techName = thumbnailsToProcessArr[thumbnailsCounter];
            friendlyName = bdlf.options.moduleFriendlyNames[techName];

            // Process template for each matched thumbnail defined in the array
            thumbnailMarkup += grunt.template.process(thumbnailTemplate,{
              data: {
                'friendlyName': friendlyName,
                'techName': techName
              }
            });
          }

          // Replace the original [[thumbnailList=' ... ']] tag with the templated output
          outputHtml = outputHtml.replace(matchedThumbnailLists[thumbnailsListCounter],thumbnailMarkup);
        }
      }

      return outputHtml;
    },

    /**
    * Parse a JSON data object based on a string literal eg: a.b.c
    * @function parseJSONFromStringLiteral
    * @param {OBJECT} dataObj The object to parse
    * @param {OBJECT} index The particular part of the string literal to process against the data object
    * @return {OBJECT} The data object
    */
    parseJSONFromStringLiteral: function(dataObj,index){
      return dataObj[index];
    },

    /**
    * Add technames and associated page urls from the styleguide generated pages to the template data object used by the static portal pages
    * @function portalPagesDataExtensionStyleguidePages
    */
    portalPagesDataExtensionStyleguidePages: function(dataObj){
      var modulesDataObj = bdlf.options.moduleFriendlyNames;
      var modulesCount = Object.keys(modulesDataObj).length;
      var currentModuleName;
      var outputDataObj = dataObj;

      // Loop through all published modules
      for(i=0; i<modulesCount; i++){
        currentModuleName = Object.keys(modulesDataObj)[i];
        outputDataObj.templateData[currentModuleName] = currentModuleName + '.html';
      }

      return outputDataObj;
    },

    /**
    * Add technames and associated page urls from the building blocks generated pages to the template data object used by the static portal pages
    * @function portalPagesDataExtensionBuildingBlocksPages
    */
    portalPagesDataExtensionBuildingBlocksPages: function(dataObj){
      var blocksDataObj = bdlf.options.buildingBlocksData;
      var blockCount = Object.keys(blocksDataObj).length;
      var currentBlockName;
      var outputDataObj = dataObj;
      var settings = grunt.config['data'].settings;

      // Add a specific building blocks identifying object
      if(outputDataObj.templateData.hasOwnProperty('buildingblocks')){
        outputDataObj.templateData.buildingblocks['allwebbuildingblocks'] = settings.fragments.buildingBlocks + '/allwebbuildingblocks.html'
      }
      else{
        outputDataObj.templateData.buildingblocks = {
          'allwebbuildingblocks': settings.fragments.buildingBlocks + '/allwebbuildingblocks.html'
        };
      }

      // Loop through all published modules
      for(i=0; i<blockCount; i++){
        currentBlockName = Object.keys(blocksDataObj)[i].toLowerCase().replace(/ /g,'');
        outputDataObj.templateData.buildingblocks[currentBlockName] = settings.fragments.buildingBlocks + '/' + currentBlockName + '.html';
      }

      return outputDataObj;
    }
  }

  /**
  * Load all configuration items from ALL tasks JavaScript files
  * @function loadConfig
  * @param {STRING} path The path in the file system where the JavaScript task files exist
  * @return {OBJECT} The object to store within grunt.initConfig
  */
  function loadConfig(path){
    var object = {};
    var key;

    glob.sync('*',{cwd:path}).forEach(function(option){
      key = option.replace(/\.js$/,'');
      object[key] = require(path + option);
    });

    return object;
  }

  /**
  * Store the data for the building block pages in alphabetical order
  * @function storeBuildingBlocksData
  */
  function storeBuildingBlocksData(){
    var functionName = 'bdlf.storeBuildingBlocksData';
    var logPrefix = '[' + functionName + ']: ';
    bdlf.log.message('['.bdlf + functionName.bdlf + ']'.bdlf);

    var modulesDataObj = bdlf.options.modulesList;
    var modulesCount = Object.keys(modulesDataObj).length;
    var currentModuleName;
    var currentModuleObj;
    var currentDesignTheme;
    var i;
    var x;
    var landingPagesToSort = {};

    // Loop through all modules with modulelist.json
    for(i=0; i<modulesCount; i++){
      currentModuleName = Object.keys(modulesDataObj)[i];
      currentModuleObj = modulesDataObj[currentModuleName];

      // Work out what the unique Design Themes exist
      for(x=0; x<currentModuleObj.designTheme.length; x++){
        currentDesignTheme = currentModuleObj.designTheme[x].trim();

        // Add an array to store all references of design themes, named as the design theme title
        if(!landingPagesToSort.hasOwnProperty(currentDesignTheme)){
          landingPagesToSort[currentDesignTheme] = [];
        }

        // Push the current module name onto the correct associated design theme
        landingPagesToSort[currentDesignTheme].push(currentModuleName);
      }
    }

    // Re-sort all of the arrays, so they are alphabetically ordered
    var designThemeGroupsCount = Object.keys(landingPagesToSort).length;
    var currentDesignArr;
    var cleanOutputObj = {};
    var themeObj;

    for(i=0; i<designThemeGroupsCount; i++){
      currentDesignTheme = Object.keys(landingPagesToSort)[i];
      currentDesignArr = landingPagesToSort[currentDesignTheme];

      currentDesignArr.sort();

      // With the Design Theme array sorted alphabetically, attach meta information, in object notation
      cleanOutputObj[currentDesignTheme] = {
        pages: []
      };

      for(x=0; x<currentDesignArr.length; x++){
        themeObj = {};
        themeObj[currentDesignArr[x]] = {
          "complexity": modulesDataObj[currentDesignArr[x]].complexity,
          "name": modulesDataObj[currentDesignArr[x]].name
        };

        cleanOutputObj[currentDesignTheme]['pages'].push(themeObj);
      }
    }

    // Store sorted module list data in memory, for later consumption
    bdlf.options.buildingBlocksData = cleanOutputObj;
  }

  /**
  * Convert an object into a comma-separated string
  * @function objectToString
  * @param {OBJECT} obj An object with a variable number of properties/values
  * @return {STRING} The concatenated object properties/values as a single string
  */
  function objectToString(obj){
    var outputObj = [];

    for(var key in obj){
      outputObj.push(key + ':' + obj[key]);
    }

    return outputObj.toString();
  }

  /**
  * Store the sub-directories with a specified directory in global scope
  * @function updateStoredModuleObject
  * @param {STRING} group The name of the group to loop through and create an object for each module contained inside it
  */
  function updateStoredModuleObject(group){
    var functionName = 'bdlf.updateStoredModuleObject';
    var logPrefix = '[' + functionName + ']: ';
    bdlf.log.message(logPrefix.bdlf + 'group=' + group);

    var directoryToRetrieve = grunt.config['data'].settings.source + '/' + group;
    var directoryToRetrieveExistence;

    // Check if directory and directory options already exists
    try{
      // Check if directory options already exists. If not, create it
      if(typeof bdlf.options.modules[group] === 'undefined'){
        bdlf.options.modules[group] = {};
      }

      directoryToRetrieveExistence = fse.lstatSync(directoryToRetrieve);

      // Only attempt to loop through the directory if it exists within the file system
      if(directoryToRetrieveExistence.isDirectory()){
        for(var i=0; i<fse.readdirSync(directoryToRetrieve).length; i++){
          bdlf.options.modules[group][fse.readdirSync(directoryToRetrieve)[i]] = {};
        }
      }
    }
    catch(error){
      bdlf.log.error(logPrefix.bdlf + 'Try/catch exception: ' + error);
    }
  }

  /**
  * Filter a specified directory for module structure and store in global scope
  * @function filterStoredModuleObject
  * @param {STRING} group The group to loop through to identify which modules should be kept stored in memory (for later use)
  */
  function filterStoredModuleObject(group){
    var functionName = 'bdlf.filterStoredModuleObject';
    var logPrefix = '[' + functionName + ']: ';
    bdlf.log.message(logPrefix.bdlf + 'group=' + group);

    var directoryToRetrieve = grunt.config['data'].settings.source + '/' + group;
    var moduleRe = bdlf.options.regExPatterns.acceptedModuleName;
    var moduleFolders = {};
    var moduleToStore;
    var currentFolder;
    var isAcceptedFolderName;
    var isDirectory;
    var containsRequiredHTMLFile;

    // Check if directory and directory options already exists
    try{
      directoryToRetrieveExistence = fse.lstatSync(directoryToRetrieve).isDirectory();

      if(directoryToRetrieveExistence){
        var storedModulesLength = Object.keys(bdlf.options.modules[group]).length;
        var module;

        for(module in bdlf.options.modules[group]){
          currentFolder = directoryToRetrieve + '/' + module;
          isAcceptedFolderName = module.match(moduleRe);
          isDirectory = fse.lstatSync(currentFolder).isDirectory();
          containsRequiredHTMLFile = fse.existsSync(currentFolder + '/' + module + '.html');

          // For any modules which don't meet the necessary validity requirements, remove them from being stored for future use, as there is no requirement to refer them past this point
          if(!isAcceptedFolderName || !isDirectory || !containsRequiredHTMLFile){
            bdlf.log.error(logPrefix.bdlf + module + ' is not required');

            delete bdlf.options.modules[group][module];
          }
          else{
            // Populate modulesList configuration data from bdlf.options.modulesList to filter "published" modules
            populateStoredModuleFromList(group,module);
          }
        }

        // Log out how many modules remain stored
        var remainingStoredModules = Object.keys(bdlf.options.modules[group]).length;
        if(remainingStoredModules > 0){
          bdlf.log.message(logPrefix.bdlf + 'Filtered modules which remain stored:\n');
        }
        else{
          bdlf.log.message(logPrefix.bdlf + 'No modules remain stored for:' + module);
        }
      }
    }
    catch(error){
      bdlf.log.error(logPrefix.bdlf + 'Try/catch exception: ' + error);
    }
  }

  /**
  * Store friendlyNames from modulelist.json into bdlf.options.moduleFriendlyNames object globally
  * @function populateFriendlyNamesFromModuleList
  */
  function populateFriendlyNamesFromModuleList(){
    var functionName = 'bdlf.populateFriendlyNamesFromModuleList';
    var logPrefix = '[' + functionName + ']: ';

    // Retrieve the modulesList
    var modulesListObj = bdlf.options.modulesList;
    var modulesTotal = Object.keys(modulesListObj).length;
    var moduleTechName;
    var moduleFriendlyName;

    bdlf.options.moduleFriendlyNames = {};

    for(i=0; i<modulesTotal; i++){
      moduleTechName = Object.keys(modulesListObj)[i];
      moduleFriendlyName = modulesListObj[Object.keys(modulesListObj)[i]].name;

      // Store a reference to the friendly name for each module name
      bdlf.options.moduleFriendlyNames[moduleTechName] = moduleFriendlyName;

      bdlf.log.message(logPrefix.bdlf + 'moduleTechName: ' + moduleTechName + ', moduleFriendlyName: ' + moduleFriendlyName);
    }
  }

  /**
  * Populate modulesList configuration data from bdlf.options.modulesList to filter "published" modules
  * @function populateStoredModuleFromList
  * @param {STRING} group The name of the group (00globals, 01elements etc)
  * @param {STRING} module The name of the module component to populate
  */
  function populateStoredModuleFromList(group,module){
    var functionName = 'bdlf.populateStoredModuleFromList';
    var logPrefix = '[' + functionName + ']: ';
    bdlf.log.message(logPrefix.bdlf + 'group=' + group + ', module=' + module);

    // Retrieve the modulesList
    var modulesList = bdlf.options.modulesList;
    var modulesTotal = Object.keys(modulesList).length;
    var i;

    for(i=0; i<modulesTotal; i++){
      if(module === Object.keys(modulesList)[i]){
        var j;
        for(j in modulesList[module]){
          bdlf.options.modules[group][module][j] = modulesList[module][j];
        }

        delete modulesList[module];
      }
    }
  }

  /**
  * Populate assets from bdlf.options.assetsList per (stored) module
  * @function populateModuleAssets
  * @param {STRING} group The name of the group (00globals, 01elements etc)
  */
  function populateModuleAssets(group){
    var functionName = 'bdlf.populateModuleAssets';
    var logPrefix = '[' + functionName + ']: ';
    bdlf.log.message(logPrefix.bdlf + 'group=' + group);

    var assetsList = bdlf.options.assetsList;
    var components;
    var componentsLength;
    var i;

    // Loop through all available assets, as specified within assetdl.json, which have been previously stored
    for(var asset in assetsList){
      // If asset has components property, copy asset name to related module component
      if(assetsList[asset].hasOwnProperty('components')){
        components = assetsList[asset].components;
        componentsLength = components.length;

        for(i=0; i<componentsLength; i++){
          for(var module in bdlf.options.modules[group]){
            if(components[i] === module){
              // Check to see if the assets property already exists. If not, create it
              if(!bdlf.options.modules[group][module].hasOwnProperty('assets')){
                bdlf.options.modules[group][module].assets = [];
              }

              // Add the matched asset name onto the assets array for the current module
              bdlf.options.modules[group][module].assets.push(asset)
            }
          }
        }
      }
    }
  }

  /**
  * Populate assets from bdlf.options.assetsList per (stored) building block page
  * @function populateBuildingBlocksAssets
  */
  function populateBuildingBlocksAssets(){
    var functionName = 'bdlf.populateBuildingBlocksAssets';
    var logPrefix = '[' + functionName + ']: ';
    bdlf.log.message('['.bdlf + functionName.bdlf + ']'.bdlf);

    var assetsList = bdlf.options.assetsList;
    var buildingBlocks = bdlf.options.buildingBlocksData;
    var designThemes;
    var designThemesLength;
    var i;

    // Building block pages
    for(var asset in assetsList){
      // If asset has a themes property, copy asset name to related theme
      if(assetsList[asset].hasOwnProperty('themes')){
        designThemes = assetsList[asset].themes;
        designThemesLength = designThemes.length;

        for(i=0; i<designThemesLength; i++){
          for(var designTheme in buildingBlocks){
            if(designThemes[i] === designTheme){
              if(!buildingBlocks[designTheme].hasOwnProperty('assets')){
                buildingBlocks[designTheme].assets = [];
              }

              // Add the matched asset name onto the assets array for the current module
              buildingBlocks[designTheme].assets.push(asset);
            }
          }
        }
      }
    }
  }

  /**
  * Generate a concatenated date and time string
  * @function getDateTime
  * @return {STRING} A concatenated date and time in the format of YYYYMMDD-HHMMSS
  */
  function getDateTime(){
    var dateObj = new Date;
    var dateFormat = [
      dateObj.getFullYear(),
      (dateObj.getMonth()+1).leadingZeros(),
      dateObj.getDate().leadingZeros()
    ].join('') + '-' + [
      dateObj.getHours().leadingZeros(),
      dateObj.getMinutes().leadingZeros(),
      dateObj.getSeconds().leadingZeros()
    ].join('');

    return dateFormat;
  }

  /**
  * Prettify the HTML snippet (and remove all spaces to compress it as much as possible for the time when it is centrally stored)
  * @function prettyPrintCode
  * @param {STRING} code The code to format, as a single string
  * @param {BOOLEAN} compact Whether or not to remove whitespace, or for it to be provided in what is returned
  * @return {STRING} Formatted code, having been prettyprinted, either compacted or not
  */
  function prettyPrintCode(code,compact){
    // Prettify the HTML snippet (and remove all spaces to compress it as much as possible for the time when it is centrally stored)
    var prettifiedCode = prettify.prettyPrint(code,{
      indent_character: bdlf.options.prettify.indentCharacter,
      indent_size: bdlf.options.prettify.indentSize,
      max_char: bdlf.options.prettify.maxChar,
      unformatted: bdlf.options.prettify.unformatted
    });

    // Remove all whitespace (tabs, linebreaks etc)
    if(compact){
      prettifiedCode = prettifiedCode.replace(bdlf.options.regExPatterns.newLineWithSpaces,'');
    }

    return prettifiedCode;
  }

  /**
   * Prepend current page name to internal named anchors (#) when used with <base href>
   * @function internalNamedAnchorsBaseHref
   * @param {STRING} content The string to convert
   * @param {STRING} currentPage The current page name
   * @return {STRING} The converted content string with internal named anchors prepended with current page name
   */
  function internalNamedAnchorsBaseHref(content, currentPage){
    var re = /( href=\"#)/g;
    var subst = ' href="' + currentPage + '#';

    return content.replace(re,subst);
  }

  /**
  * Capitalize the first letter of every word of a string
  * @function toTitleCase
  * @param {STRING} input The string to convert
  * @return {STRING} The converted string in title case
  */
  function toTitleCase(input){
    return input.replace(/\w\S*/g,function(text){
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    });
  }

  /**
  * Remove duplicates from an array
  * @function removeArrayDuplicates
  * @param {ARRAY} array The array to be de-duped
  * @return {ARRAY} The original array with duplicates removed
  */
  function removeArrayDuplicates(array){
    // Declare an object de-dupe object
    var dedupeObj = {}
    var i;
    var output = [];
    var key;

    // Store each array element inside an object
    for(i=0; i<array.length; i++){
      dedupeObj[array[i]] = true;
    }

    // Populate the array with the object keys
      for(key in dedupeObj){
        output.push(key);
    }

    return output.sort();
  }

  /**
  * Recursively treewalk a specified directory, retrieving all files names in a flattened structure
  * @function fileTreeWalk
  * @param {STRING} directory The directory to treewalk
  * @return {ARRAY} An array of all files round
  */
  function fileTreeWalk(directory){
    var filesFolderObj = fse.readdirSync(directory);
    var isDirectory;
    var isFile;
    var isInvalid;
    var validFolderRe = bdlf.options.regExPatterns.acceptedModuleName;
    var directoryFragmentArr;
    var folderName;
    var fileName;
    var fileUrl;
    var fileUrlForData;

    for(var i=0; i<filesFolderObj.length; i++){
      isInvalid = filesFolderObj[i].match(validFolderRe) === null;
      isDirectory = fse.lstatSync(directory + filesFolderObj[i]).isDirectory();
      isFile = fse.lstatSync(directory + filesFolderObj[i]).isFile();

      if(!isInvalid){
        if(isFile){
          fileUrl = directory + filesFolderObj[i];
          fileUrlForData = fileUrl.replace('source/03portalpages/','');
          directoryFragmentArr = directory.substr(0,directory.length-1).split('/');

          fileName = filesFolderObj[i].replace('.html','');
          folderName = directoryFragmentArr[directoryFragmentArr.length-1];

          if(folderName === '03portalpages'){
            bdlf.options.portalStaticPages.templateData[fileName] = fileUrlForData;
          }
          else{
            bdlf.options.portalStaticPages.templateData[folderName][fileName] = fileUrlForData;
          }

          bdlf.options.portalStaticPages.files.push(fileUrl);
        }
        else if(isDirectory){
          if(filesFolderObj[i] !== 'data'){
            // Create a data property for the file system group
            bdlf.options.portalStaticPages.templateData[filesFolderObj[i]] = {};

            // Recursively treewalk a specified directory, retrieving all files names in a flattened structure
            bdlf.fileTreeWalk(directory + filesFolderObj[i] + '/');
          }
        }
      }
    }

    return bdlf.options.portalStaticPages;
  }

  return {
    fileTreeWalk: fileTreeWalk,
    filterStoredModuleObject: filterStoredModuleObject,
    getDateTime: getDateTime,
    internalNamedAnchorsBaseHref: internalNamedAnchorsBaseHref,
    loadConfig: loadConfig,
    log: log,
    options: options,
    populateBuildingBlocksAssets: populateBuildingBlocksAssets,
    populateFriendlyNamesFromModuleList: populateFriendlyNamesFromModuleList,
    populateModuleAssets: populateModuleAssets,
    populateStoredModuleFromList: populateStoredModuleFromList,
    prettyPrintCode: prettyPrintCode,
    removeArrayDuplicates: removeArrayDuplicates,
    storeBuildingBlocksData: storeBuildingBlocksData,
    templating: templating,
    toTitleCase: toTitleCase,
    updateStoredModuleObject: updateStoredModuleObject
  };
};