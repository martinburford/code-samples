/**
 * File: /nodejs/json.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

const fs = require('fs');
const CONSTS = {
  urls: {
    dashboard: {
      pathPrefix: './../dist/assets/data/dashboard/'
    }
  }
}

/**
 * Capitalize the first letter of a string of text
 * @function capitalize
 */
String.prototype.capitalize = function(){
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Generate some sample JSON data
 * @function dashboardData
 * @param {number} pageNumber - The page number to use when creating the column value for the 'Team' column
 * @param {boolean} randomStatus - Whether or not the status will be generated 1-12 (in order) or completely randomly
 */
const dashboardData = (pageNumber=1, randomStatus=false, recordsInPage=12, totalRecordCount=0) => {
  const columnHeadings = [
    'id',
    'team',
    'client',
    'brand',
    'testId',
    'name',
    'origin',
    'date',
    'plannedDate',
    'status',
    'theme',
    'area',
    'device',
    'location',
    'win',
    'resultsSummary',
    'duration',
    'plannedDuration',
    'priority',
    'score',
    'workbookJobNumber'
  ];

  const statusValues = [
    '1. Backlog',
    '2. Candidate',
    '3. Defined',
    '4. Planned',
    '5. Production',
    '6. Live',
    '7. Paused',
    '8. Ended',
    '9. Completed',
    '10. 100%',
    '11. Done',
    '12. Cancelled'
  ];

  const columnValues = [
    'Martin',
    'Sebby',
    'Daniela',
    'Adam',
    'Liesel',
    'Imogen',
    'Ruth',
    'Steve',
    'Beth',
    'Rachel',
    'Matt',
    'Suzie',
    'Grace',
    'Lynsey',
    'Barnaby',
    'Liam',
    'Linda',
    'Joe',
    'Luke',
    'Mollie',
    'Kieran'
  ];

  const priorities = [
    1,
    2,
    3
  ];

  const countries = [
    'AT', // Austria
    'BE', // Belgium
    'DK', // Denmark
    'FR', // France
    'DE', // Germany
    'IT', // Italy
    'LU', // Luxembourg
    'NL', // Netherlands
    'SE', // Sweden
    'CH', // Switzerland
    'GB', // United Kingdom
    'US'  // United States
  ];

  const data = {
    count: totalRecordCount,
    rows: []
  };

  let tempStatuses;
  if(randomStatus){
    tempStatuses = statusValues.slice(0);
  }

  for(let i=0; i<=(recordsInPage-1); i++){
    let newData = {};

    for(let x=0; x<=columnHeadings.length-1; x++){
      let columnHeading = columnHeadings[x];
      let columnValue;
      let statusColumnIndex;
      let statusColumnNumberPosition;
      let statusData;

      switch(columnHeading){
        case 'id':
          columnValue = i+1;
          break;

        case 'testId':
          columnValue = '1234.56';
          break;

        case 'theme':
          columnValue = null;
          break;

        case 'area':
          columnValue = ['Area 1','Area 2'];
          break;

        case 'device':
          columnValue = ['Mobile','Tablet','Desktop'];
          break;

        case 'location':
          const howManyCountries = Math.floor(Math.random() * 2) + 1; // Generate between 1 and 3 flags per record
          const availableCountries = countries.length-1;
          let randomCountries = [];
          let countriesLeftToChoose = howManyCountries;

          while(countriesLeftToChoose > 0){
            let newCountry = countries[Math.floor(Math.random() * availableCountries) + 1];

            if(!randomCountries.includes(newCountry)){
              randomCountries.push(newCountry);
              countriesLeftToChoose--;
            }
          }

          columnValue = randomCountries;
          break;

        case 'status':
          columnValue = {};

          if(randomStatus){
            statusColumnIndex = Math.floor(Math.random() * (tempStatuses.length - 1));

            // Assign the random statuses
            statusData = tempStatuses[statusColumnIndex].split('.');
            statusColumnNumberPosition = statusData[0];

            columnValue.text = statusData[1].capitalize().trim();
            columnValue.code = parseInt(Array(Math.max(2 - String(statusColumnNumberPosition).length + 1, 0)).join(0) + statusColumnNumberPosition);

            // Remove the random item from the temporary status array
            tempStatuses.splice(statusColumnIndex, 1);
          } else {
            columnValue.text = statusValues[i].capitalize();
            columnValue.code = parseInt(Array(Math.max(2 - String(i+1).length + 1, 0)).join(0) + (i+1));
          }

          break;

        case 'team':
          columnValue = `Team ${columnValues[Math.floor(Math.random() * (columnValues.length - 1)) + 1]} (page ${pageNumber})`;
          break;

        case 'client':
          columnValue = `Client ${columnValues[Math.floor(Math.random() * (columnValues.length - 1)) + 1]} (page ${pageNumber})`;
          break;

        case 'win':
          columnValue = Math.round(Math.random());
          break;
          
        case 'workbookJobNumber':
          columnValue = '5c2dd4c2-fb17';
          break;

        case 'date':
        case 'plannedDate':
          columnValue = '2018-02-02T00:00:00'
          break;

        case 'priority':
          const randomIndex = columnValue = Math.floor(Math.random() * 3) + 1;
          columnValue = priorities[randomIndex-1];
          break;

        case 'score':
          columnValue = Math.floor(Math.random() * 10) + 1;
          break;

        default:
          columnValue = columnValues[Math.floor(Math.random() * (columnValues.length - 1)) + 1];
          break;
      }

      // Assign the correct column value, based on the column type
      newData[columnHeadings[x]] = columnValue;
    }

    // Attach logic for whether the following items in Dot Menu are allowed or not
    newData.dotMenuAllowEdit = true;
    newData.dotMenuAllowCopyTestLink = true;
    newData.dotMenuAllowDuplicate = true;
    newData.dotMenuAllowCandidate = true; // status === 1
    newData.dotMenuAllowCancelTest = true; // status < 6

    data.rows.push(newData);
  }

  console.log(`Dashboard - page ${pageNumber} data created`);

  // Generate (local stub) JSON files for /dist directory of the website, to be used by the UI
  generateStubJSONFiles(`${CONSTS.urls.dashboard.pathPrefix}page-${pageNumber}.json`, data);
}

/**
 * Generate an error JSON file
 * @function dashboardErrorData
 * @param {number} pageNumber - The page number to use as part of the file name (page-x.json)
 */
const dashboardErrorData = (pageNumber) => {
  const data = {
    "error": {
      "exception": "Exception text",
      "message": "Message text"
    }
  }

  console.log(`Dashboard - page ${pageNumber} (error) data created`);

  // Generate (local stub) JSON files for /dist directory of the website, to be used by the UI
  generateStubJSONFiles(`${CONSTS.urls.dashboard.pathPrefix}page-${pageNumber}.json`, data);
}

/**
 * Generate (local stub) JSON files for /dist directory of the website, to be used by the UI
 * @function generateStubJSONFiles
 * @param {string} path - The path of where to generate the JSON file
 */
const generateStubJSONFiles = (path, data) => {
  // Write the JSON file to the file system, for the website to use
  fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

// GENERATE JSON FILES

// Dashboard
dashboardData(1, true, 12, 56); // Page 1
dashboardData(2, true, 12, 56); // Page 2
dashboardData(3, true, 12, 56); // Page 3
dashboardData(4, true, 12, 56); // Page 4
dashboardData(5, true, 8, 56); // Page 5

// Generate an error oage
// dashboardErrorData(6); // Error page (which is page 6)