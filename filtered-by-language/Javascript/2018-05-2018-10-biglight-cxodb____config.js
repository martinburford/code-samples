/**
 * File: /assets/scripts/config.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

import url from 'url';

const urlData = url.parse(window.location.href);
const localDomain = `${urlData.protocol}//${urlData.host}`;

// Global configuration properties for the entire site
export const CONSTS = {
  api: {
    components: {
      dashboard: {
        recordsPerPage: 12,
        url: 'dashboard/{{localFilename}}'
      },
      createDevice: 'createDevice',
      createNewDropdownItem: 'createNewDropdownItem',
      createSplit: 'createSplit',
      deleteDevice: 'deleteDevice',
      deleteFile: 'deleteFile',
      deleteSplit: 'deleteSplit',
      duplicateTest: 'duplicateTest',
      retrieveBrands: 'retrieveBrands',
      retrieveGroups: 'retrieveGroups',
      saveTest: 'saveTest',
      updateTest: 'updateTest',
      updateTestStatus: 'updateTestStatus',
      uploadFile: 'uploadFile'
    },
    domains: {
      live: '/api/',
      local: `${localDomain}/`
    },
    formSubmits: {
      createUser: {
        httpMethod: 'POST',
        successRedirectUrl: '/users',
        url: 'createUser'
      },
      createTest: {
        httpMethod: 'POST',
        successRedirectUrl: '/edit/[ID]',
        url: 'createTest'
      },
      updateTest: {
        httpMethod: 'PUT',
        url: 'updateTest'
      },
      updateUser: {
        httpMethod: 'PUT',
        url: 'updateUser'
      }
    },
    mode: 'live' // || 'live'
  },
  logger: {
    active: false
  }
}