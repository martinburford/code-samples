var site = (function(){
  var options = {
      apiEndpoints: {
        development: {
          fullJourney: {
            create: {
              method: 'post',
              url: '/apiStubs/fullJourney/create.json'
            },
            retrieve: {
              method: 'get',
              url: '/apiStubs/fullJourney/retrieve.json'
            },
            update: {
              method: 'put',
              url: '/apiStubs/fullJourney/update.json'
            }
          },
          login: {
            method: 'get',
            url: '/apiStubs/login/success.json'
          }
        },
        environment: 'development',
        production: {
          fullJourney: {
            create: {
              method: 'post',
              url: 'https://profile-microservice.cf.wgdc-drn-01.cloud.uk.hsbc/connect/profiles/'
            },
            retrieve: {
              method: 'get',
              url: 'https://profile-microservice.cf.wgdc-drn-01.cloud.uk.hsbc/connect/profiles/'
            },
            update: {
              method: 'put',
              url: 'https://profile-microservice.cf.wgdc-drn-01.cloud.uk.hsbc/connect/profiles/'
            }
          },
          login: {
            method: 'post',
            url: 'https://authentication-service.cf.wgdc-drn-01.cloud.uk.hsbc/rest/login'
          }
        }
      }
  };

  /**
   * Initialize all site-wide functionality from a single entry-point
   * @function init
   */
  function init(){
    // Initialize all site-wide events
    eventsInit();

    // Update the onscreen data storage indicator
    utilities.refreshDataStorageDebug();
  }

  /**
   * Initialize all site-wide events
   * @function eventsInit
   */
  function eventsInit(){
    // Empty all persisted data storage (in data storage)
    var resetDataStorageElem = document.getElementById('reset-datastorage');
    if(resetDataStorageElem){
      document.getElementById('reset-datastorage').addEventListener('click', function(e){
        e.preventDefault();

        // Empty out any and all previously stored data
        fullJourney.options.formData = {
          connectionName: {},
          contactDetails: {},
          transmissionProtocol: {},
          messageProtocol: {},
          files: {},
          serverDetails: {}
        };

        // Update the onscreen data storage indicator
        utilities.refreshDataStorageDebug();
      });
    }

    // Toggle the visibility of the data storage debug bar
    var dataStorageTriggerElem = document.getElementById('datastorage-trigger');
    if(dataStorageTriggerElem){
      document.getElementById('datastorage-trigger').addEventListener('click', function(e){
        e.preventDefault();

        this.classList.toggle('contracted');
        document.getElementById('datastorage-contents').classList.toggle('contracted');
      });
    }

    // Toggle on and off debug colours
    var debugColoursElem = document.getElementById('debug-colours');
    if(debugColoursElem){
      document.getElementById('debug-colours').addEventListener('click', function(e){
        e.preventDefault();

        document.body.classList.toggle('debug-colours');
      });
    }

    // Add the uploaded file name to the label within the active file browser
    events.delegate(document.body, '.file-browser input', 'change', function(e){
      var fileUploaded = this.value.split('\\');

      this.nextElementSibling.nextElementSibling.innerText = fileUploaded[fileUploaded.length-1];
    });
  }

  return {
    apiEnvironment: options.apiEndpoints.environment,
    init: init,
    options: options
  }
}());

Element.prototype.appendBefore = function(element){
  element.parentNode.insertBefore(this, element);
};

Element.prototype.appendAfter = function(element){
  element.parentNode.insertBefore(this, element.nextSibling);
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
