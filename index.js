/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-power-select-with-create',

  contentFor: function(type, config) {
    var emberPowerSelect = this.addons.filter(function(addon) {
      return addon.name === 'ember-power-select';
    })[0]
    return emberPowerSelect.contentFor(type, config);
  }
};
