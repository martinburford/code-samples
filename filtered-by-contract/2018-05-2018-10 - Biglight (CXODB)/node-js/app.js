// Default Express dependencies
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const extend = require('extend');
const favicon = require('serve-favicon');
const fs = require('fs');
const fse = require('fs-extra');
const getPageData = require('./dev/modules/getPageData');
const path = require('path');
const fileUpload = require('express-fileupload');
const uuid = require('uuid/v1');

// Setup Express configuration
const app = express();
const pageRouter = express.Router();

// View engine (templates) configuration
app.set('views', path.join(__dirname, 'dev', 'views'));
app.set('view engine', 'pug');
app.set('versionSuffix', '?v=' + JSON.parse(fs.readFileSync('./package.json')).version);

// Ensure that pretty indentation persists for the rendered markup (on the client)
app.locals.pretty = true;

// Uncomment after placing favicon.ico within /public
// app.use(favicon(path.join(__dirname, 'wwwroot', 'dist', 'assets', 'favicon.ico')));
// app.use(favicon(path.join(__dirname, 'wwwroot', 'dist', 'assets', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Static paths for CSS, images, JavaScript
app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'dist', 'assets', 'uploads')));

// Post paths (for file-uplaoder)
app.use(fileUpload());

const pages = [
  { type: 'demo', view: 'dashboard'},
  { type: 'demo', view: 'edit'},
  { type: 'demo', view: 'forgotten-password'},
  { type: 'demo', view: 'global'},
  { type: 'demo', view: 'login'},
  { type: 'demo', view: 'overview'},
  { type: 'demo', view: 'password-reset'},
  { type: 'demo', view: 'variations'},
  { type: 'final', view: 'add'},
  { type: 'final', view: 'add-user'},
  { type: 'final', view: 'dashboard'},
  { type: 'final', view: 'edit'},
  { type: 'final', view: 'edit-user'},
  { type: 'final', view: 'forgotten-password'},
  { type: 'final', view: 'login'},
  { type: 'final', view: 'overview'},
  { type: 'final', view: 'overview-no-results'},
  { type: 'final', view: 'password-reset'},
  { type: 'final', view: 'users'},
  { type: 'final', view: 'variations'}
];

let pageData;

[...pages].forEach((page) => {
  // Retrieve the page data
  pageData = getPageData.retrieveData(page.view);

  console.log(`Page data retrieved for: ${page.type}/${page.view}`);

  // If any extensions to the page data are required, perform that extension here
  extend(pageData, {});

  // Setup the route for the view
  pageRouter.get(`/${page.type}/${page.view}`, function(request, response, next){
    // Render the page template, with the associated page data
    response.render(`${page.type}/${page.view}`, {
      data: pageData
    });
  });

  app.get(`/${page.type}/${page.view}`, pageRouter);
});

// DOT MENU: Update the status of a test
app.get('/updateTestStatus', function(request, response){
  const experimentId = request.query.experimentId;
  const statusCode = request.query.statusCode;
  const statusType = request.query.statusType;

  const httpResponse = {
    experimentId,
    statusCode,
    statusType,
    updated: true
  }

  // Update an existing experiment, passing back a success boolean
  response.send(httpResponse);

  console.log(`(/updateTestStatus) >>> HTTP response back to the UI: newId: ${httpResponse.updated}`);
});

// FORM: Duplicate a test
app.get('/duplicateTest', function(request, response){
  const httpResponse = {
    newId: uuid()
  }

  // Duplicate an existing experiment, passing back the Id of the newly created experiment
  response.send(httpResponse);

  console.log(`(/duplicateTest) >>> HTTP response back to the UI: newId: ${httpResponse.newId}`);
});

// FORM: Create new test
app.post('/createTest', function(request, response){
  const httpResponse = {
    testId: uuid()
  }

  // Create a unique deviceId, and send that back to the UI
  response.send(httpResponse);

  console.log(`(/createTest) >>> HTTP response back to the UI: testId: ${httpResponse.testId}`);
});

// FORM: Create a device
app.get('/createDevice', function(request, response){
  const httpResponse = {
    deviceId: uuid()
  }

  // Create a unique deviceId, and send that back to the UI
  response.send(httpResponse);

  console.log(`(/createDevice) >>> HTTP response back to the UI: deviceId: ${httpResponse.deviceId}`);
});

// FORM: delete a device
app.get('/deleteDevice', function(request, response){
  const deviceId = request.query.deviceId;

  console.log(`(/deleteDevice) >>> deviceId: ${deviceId}`);

  const httpResponse = {
    deleted: true,
    deviceId
  };

  // Inform the UI that the device deletion was successful
  response.send(httpResponse);
});

// FILE UPLOADER: upload a file
app.post('/uploadFile', function(request, response){
  const assetType = request.body.assetType;
  const deviceId = request.body.deviceId;
  const experimentId = request.body.experimentId;
  const newFile = request.files.files;
  const newFileName = newFile.name;

  let debug = `(/uploadFile) >>> File received on server: ${newFileName}, `;
  debug += `experimentId: ${experimentId}, `;
  debug += `deviceId: ${deviceId}, `;

  // The destination path of the file being upload is slightly different depending on whether the asset is of type 'control' or 'gallery'
  // There is 1 extra level of nesting if it's a gallery asset
  let uploadPathPrefix = `./dist/assets/uploads/${experimentId}/${deviceId}`;

  if(assetType === 'gallery'){
    const splitId = request.body.splitId;

    uploadPathPrefix += `/${splitId}`;

    // Add the splitId into the server debug output
    debug += `splitId: ${splitId}, `;
  }

  const filePath = `${uploadPathPrefix}/${newFileName}`;
  const assetHttpPath = filePath.replace('./dist/assets','');

  debug += `assetType: ${assetType}, `;
  debug += `filePath: ${filePath}, `;
  debug += `uploadPathPrefix: ${uploadPathPrefix}, `;

  console.log(debug);

  if(!request.files){
    return response.status(400).send('(/uploadFile) >>> No files were posted to the url: /uploadFile');
  }

  fse.ensureDir(uploadPathPrefix, err => {
    newFile.mv(filePath, (err) => {
      if(err) {
        return response.status(500).send(err);
      }

      const httpResponse = {
        assetFilename: newFileName,
        assetId: uuid(),
        assetSrc: assetHttpPath,
        assetType: assetType
      }

      console.log('(/uploadFile) >>> File uploaded successfully');

      // Send the response back to the client from the server
      response.send(httpResponse);

      console.log(`(/uploadFile) >>> HTTP response back to the UI: assetFilename: ${httpResponse.assetFilename}, assetId: ${httpResponse.assetId}, assetSrc: ${httpResponse.assetSrc}, assetType: ${httpResponse.assetType}, experimentId: ${experimentId}`);
    });
  });
});

// FILE UPLOADER: delete a file
app.post('/deleteFile', function(request, response){
  const assetId = request.body.assetId;
  const assetType = request.body.assetType;
  const deviceId = request.body.deviceId;
  const experimentId = request.body.experimentId;
  const fileName = request.body.assetFileName;

  let debug = `(/deleteFile) >>> assetId: ${assetId}, `;
  debug += `experimentId: ${experimentId}, `;
  debug += `deviceId: ${deviceId}, `;

  // The path of the file being deleted is slightly different depending on whether the asset is of type 'control' or 'gallery'
  // There is 1 extra level of nesting if it's a gallery asset
  let deletePathPrefix = `./dist/assets/uploads/${experimentId}/${deviceId}`;

  if(assetType === 'gallery'){
    const splitId = request.body.splitId;

    deletePathPrefix += `/${splitId}`;

    // Add the splitId into the server debug output
    debug += `splitId: ${splitId}, `;
  }

  const filePath = `${deletePathPrefix}/${fileName}`;

  debug += `assetType: ${assetType}, `;
  debug += `filePath: ${filePath}, `;

  console.log(debug);

  fse.pathExists(filePath, err => {
    fse.remove(filePath, err => {
      console.log(`(/deleteFile) >>> File "${filePath}" removed from the server`);

      // Inform the UI that the file deletion was successful
      response.send({
        assetId,
        deleted: true
      });
    });
  });
});

// FORM: create a split
app.get('/createSplit', function(request, response){
  const httpResponse = {
    splitId: uuid()
  }

  // Create a unique splitId, and send that back to the UI
  response.send(httpResponse);

  console.log(`(/createSplit) >>> HTTP response back to the UI: splitId: ${httpResponse.splitId}`);
});

// FORM: delete a split
app.get('/deleteSplit', function(request, response){
  const splitId = request.query.splitId;

  console.log(`(/deleteSplit) >>> splitId: ${splitId}`);

  const httpResponse = {
    deleted: true,
    splitId
  };

  // Inform the UI that the split deletion was successful
  response.send(httpResponse);
});

// FORM: retrieve Groups (based on a Team)
app.get('/retrieveGroups', function(request, response){
  const teamId = request.query.teamId;
  const httpResponse = JSON.parse(fs.readFileSync(`./dev/data/retrieveGroups/team-${teamId}.json`));

  // Return the correct groups
  response.send(httpResponse);
});

// FORM: retrieve Brands (based on a Group)
app.get('/retrieveBrands', function(request, response){
  const groupId = request.query.groupId;
  const httpResponse = JSON.parse(fs.readFileSync(`./dev/data/retrieveBrands/group-${groupId}.json`));

  // Return the correct groups
  response.send(httpResponse);
});

// FORM: Add a new item to a dropdown
app.get('/createNewDropdownItem', function(request, response){
  const httpResponse = {
    label: request.query.label,
    value: uuid()
  }

  // Create a unique dropdown item value, and send that (along with the provided label text) back to the UI
  response.send(httpResponse);

  console.log(`(/createNewDropdownItem) >>> HTTP response back to the UI: label: ${httpResponse.label}, value: ${httpResponse.value}`);
});

// FORM: Create new user
app.post('/createUser', function(request, response){
  const httpResponse = {
    userId: uuid()
  }

  // Create a unique userId, and send that back to the UI
  response.send(httpResponse);

  console.log(`(/createTest) >>> HTTP response back to the UI: userId: ${httpResponse.userId}`);
});

// Listen for changes on the server to ensure the correct pages are viewed in respect of the requested URL
app.listen(3000);
console.log('Server listening on http://localhost:3000');