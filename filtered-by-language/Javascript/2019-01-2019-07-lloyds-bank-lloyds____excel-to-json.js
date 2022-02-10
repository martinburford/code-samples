/* eslint-disable */

const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const extend = require('extend');

// A reference object for when creating nested properties (per component)
const nestedProperties = {};

const result = excelToJson({
  header: {
    rows: 3,
  },
  sheets: [
    {
      columnToKey: {
        A: 'Brand',
        B: 'Channel',
        C: 'Component',
        D: 'Key',
        F: 'Copy',
      },
      name: 'Translations',
    },
  ],
  sourceFile: 'translations.xlsx',
});

// Configuration determining how to retrieve the data from the spreadsheet
const configuration = {
  brands: {
    BoS: {
      channels: ['cbo', 'o4b', 'retail'],
    },
    Halifax: {
      channels: ['retail'],
    },
    Lloyds: {
      // channels: ['cbo', 'o4b', 'retail'],
      channels: ['retail'],
    },
    MBNA: {
      channels: ['retail'],
    },
  },
  components: [
    'activationCode',
    'activateCodeReorder',
    'activateYourAccount',
    'appPromo',
    'appSignChoice',
    'browserUpdate',
    'cancelDialog',
    'cardReader',
    'chooseAuthMethod',
    'connect',
    'continueWithAppSign',
    'deviceCheck',
    'deviceError',
    'deviceNotRegistered',
    'deviceVerified',
    'didntTrustDevice',
    'ecomAppSign',
    'ecomNumber',
    'ecomSmsOtp',
    'eia1',
    'eia2',
    'eiaFraud',
    'eiaInvalidCode',
    'eiaNoAnswer',
    'fallback',
    'genericError',
    'havingTrouble',
    'loading',
    'loadingScreen',
    'mi',
    'oneAttemptRemaining',
    'password',
    'passwordMI',
    'phoneAvailable',
    'pickNumber',
    'SDID',
    'SDIDMVP',
    'SDIDNotTrusted',
    'SDIDTrusted',
    'SDIDTrustedMVP',
    'smsOtp',
    'stepUpIntro',
    'strongDevice',
    'strongDeviceSaved',
    'switchAuthType',
    'trustDevice',
    'trustDeviceAppSign',
    'trustDeviceRemember',
    'twoStepStrongDevice',
    'userId',
    'userIdPassword',
  ],
};

/**
 * @function filterContent - Retrieve content from the Excel data retrieval in respect of a brand/channel/component combination
 * @param {string} brand - The brand to retrieve data for
 * @param {string} channel - The channel to retrieve data for
 * @param {string} component - The component to retrieve data for
 * @returns {object} - The keys and translatable content for each brand/channel/component combination
 */
const filterContent = (brand, channel, component) => {
  // Create a nest placeholder for the current component, to handle nesting (if required)
  nestedProperties[component] = {};
  nestedProperties[component].nestedKeys = [];

  const requiredData = result.Translations.filter(row => {
    return (
      row.Brand === brand &&
      row.Channel === channel &&
      row.Component === component
    );
  }).reduce((previousData, newData) => {
    // Check whether copy for a specific row in the Excel sheet requires nested JSON or not
    const isNested = newData.Key.includes(' > ');

    // Extend the components properties from the previous data within this reduce() operation
    let rowData = {
      ...previousData,
    };

    // If the current row requires nested JSON
    if (isNested) {
      generatedNestedChildProperties(component, newData.Key, newData.Copy);

      // Store a reference to which keys have nesting (for the current component)
      // It will be attached to the JSON outside of this filter/reduce
      if (
        !nestedProperties[component].nestedKeys.includes(
          newData.Key.split(' > ')[0]
        )
      ) {
        nestedProperties[component].nestedKeys.push(
          newData.Key.split(' > ')[0]
        );
      }
    }
    // If the current row is a static string of text
    else {
      rowData[newData.Key] = newData.Copy;
    }

    return rowData;
  }, {});

  // If the reference object for the current component has properties, attach them to the JSON for the current component
  if (
    Object.entries(nestedProperties[component]).length !== 0 &&
    nestedProperties[component].constructor === Object
  ) {
    nestedProperties[component].nestedKeys.forEach(nestedKeyname => {
      // Attach the nested structure to the JSON brand/channel/component data
      extend(true, requiredData, nestedProperties[component]);
    });
  }

  // Recursively sort the object properties for a component alphabetically
  const sortedObject = sortObjectKeys(requiredData);

  return sortedObject;
};

/**
 * @function generatedNestedChildProperties - Build a JSON object with all nested properties from flat Excel structure
 * @param {object} nestData - The corresponding data node in nestedProperties object for the current component (at the current level of nesting)
 * @param {string} key - The key name which requires nesting
 * @param {string} value - The value of the nested key
 * @returns {object} - A single nested object of JSON
 */
const generatedNestedChildProperties = (component, key, value) => {
  // An excel string requiring nesting typically is received in this format: nesting level 1 > nesting level 2 > nesting level 3 etc.
  const obj = key
    .split(' > ')
    .reverse()
    .reduce((data, key) => {
      return {
        [key]: data,
      };
    }, value);

  // Store the recursive nested JSON properties for later use
  extend(true, nestedProperties[component], obj);
};

/**
 * @function sortObjectKeys - Recursively sort the object properties for a component alphabetically
 * @param {object} obj - The data object to be sorted by property names
 * @returns {object} - The object, correctly sorted alphabetically
 */
const sortObjectKeys = obj => {
  return Object.keys(obj)
    .sort()
    .reduce((data, key) => {
      // Process arrays
      if (Array.isArray(obj[key])) {
        data[key] = obj[key].map(sortObjectKeys);
      }

      // Process objects
      if (typeof obj[key] === 'object') {
        data[key] = sortObjectKeys(obj[key]);
      } else {
        data[key] = obj[key];
      }

      return data;
    }, {});
};

/**
 * @function buildTranslationFile - Generate a JSON translation file for a specific brand
 * @param {string} brand - Either 'BoS' || 'Halifax' || 'Lloyds' || 'MBNA'
 */
const buildTranslationFile = brand => {
  // The initial data block for the JSON file being generated
  let translationData = {
    _brand: brand,
  };

  // Loop through each channel that content exists for (for the provided brand)
  configuration.brands[brand].channels.forEach(channel => {
    translationData._channel = channel;

    console.log(`**** buildTranslationFile (${brand}), (${channel}) ****`);

    // Loop through all component names to ensure all content is retrieved for each brand/channel
    configuration.components.forEach(component => {
      translationData[component] = filterContent(brand, channel, component);
    });

    fs.writeFileSync(
      `${brand.toLowerCase()}.${channel}.json`,
      JSON.stringify(translationData, null, 2)
    );
  });

  console.log(translationData);
};

// buildTranslationFile('bos');
// buildTranslationFile('halifax');
buildTranslationFile('Lloyds');
// buildTranslationFile('mbna');

// TODO:
// Once a brand is completed, remove its entry from the initial Excel data retrieval
// Otherwise one brand/channel reference may interfere with another previously completed
// delete object.property;
