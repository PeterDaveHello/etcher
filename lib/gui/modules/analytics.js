/*
 * Copyright 2016 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * @module Etcher.Modules.Analytics
 */

const _ = require('lodash');
const angular = require('angular');
const resinRaven = require('resin-raven/browser');
const errors = require('../../shared/errors');
const packageJSON = require('../../../package.json');

const MODULE_NAME = 'Etcher.Modules.Analytics';
const analytics = angular.module(MODULE_NAME, [
  require('../models/settings')
]);

analytics.config(() => {
  resinRaven.install({
    services: {
      sentry: process.env.SENTRY_DSN,
      mixpanel: process.env.MIXPANEL_TOKEN
    },
    options: {
      release: packageJSON.version
    }
  });
});

analytics.service('AnalyticsService', function($log, SettingsModel) {

  /**
   * @summary Log a debug message
   * @function
   * @public
   *
   * @description
   * This function sends the debug message to Sentry only.
   *
   * @param {String} message - message
   *
   * @example
   * AnalyticsService.log('Hello World');
   */
  this.logDebug = (message) => {
    if (SettingsModel.get('errorReporting')) {
      resinRaven.logDebug(message);
    }
  };

  /**
   * @summary Log an event
   * @function
   * @public
   *
   * @description
   * This function sends the debug message to error reporting services.
   *
   * @param {String} message - message
   * @param {Object} [data] - event data
   *
   * @example
   * AnalyticsService.logEvent('Select image', {
   *   image: '/dev/disk2'
   * });
   */
  this.logEvent = (message, data) => {
    if (SettingsModel.get('errorReporting')) {
      resinRaven.logEvent(message, data);
    }
  };

  /**
   * @summary Log an exception
   * @function
   * @public
   *
   * @description
   * This function logs an exception to an error reporting service.
   *
   * @param {Error} exception - exception
   *
   * @example
   * AnalyticsService.logException(new Error('Something happened'));
   */
  this.logException = (exception) => {
    if (_.every([
      SettingsModel.get('errorReporting'),
      errors.shouldReport(exception)
    ])) {
      resinRaven.logException(exception);
    } else {
      $log.error(exception);
    }
  };

});

module.exports = MODULE_NAME;
