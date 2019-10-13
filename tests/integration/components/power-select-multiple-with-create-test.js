import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { typeInSearch, clickTrigger } from 'ember-power-select/test-support/helpers';
import { findAll, click } from 'ember-native-dom-helpers';

module('Integration | Component | power select with create', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  hooks.beforeEach(function() {
    this.set('countries', A([
      { name: 'United States',  code: 'US', population: 321853000 },
      { name: 'Spain',          code: 'ES', population: 46439864 },
      { name: 'Portugal',       code: 'PT', population: 10374822 },
      { name: 'Russia',         code: 'RU', population: 146588880 },
      { name: 'Latvia',         code: 'LV', population: 1978300 },
      { name: 'Brazil',         code: 'BR', population: 204921000 },
      { name: 'United Kingdom', code: 'GB', population: 64596752 },
    ]));
    this.actions.createCountry = (countryName) => {
      let newCountry = {name: countryName, code: 'XX', population: 'unknown'};
      this.get('countries').pushObject(newCountry);
    };
  });

  test('it displays multiple selections correctly', async function(assert) {
    assert.expect(2);

    const initialSelection = [this.get('countries.firstObject')];
    this.set('selectedCountries', initialSelection);

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @options={{countries}}
        @selected={{selectedCountries}}
        @onChange={{action (mut selectedCountries)}}
        @onCreate={{action "createCountry"}} as |country|
      >
        {{country.name}}
      </PowerSelectMultipleWithCreate>
    `);

    const selectedOptions = findAll('.ember-power-select-multiple-option');
    assert.equal(selectedOptions.length, initialSelection.length);
    assert.ok(selectedOptions[0].textContent.trim().indexOf(initialSelection[0].name) !== -1);
  });

  test('it passes an array to onChange in multiple mode', async function(assert) {
    assert.expect(4);

    this.set('selectedCountries', []);
    this.actions.selectCountries = function(countries) {
      assert.ok(countries instanceof Array);
      this.set('selectedCountries', countries);
    };

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @options={{countries}}
        @selected={{selectedCountries}}
        @onChange={{action "selectCountries"}}
        @onCreate={{action "createCountry"}} as |country|
      >
        {{country.name}}
      </PowerSelectMultipleWithCreate>
    `);

    await clickTrigger();
    await click(findAll('.ember-power-select-option')[0]);

    assert.equal(this.get('selectedCountries.length'), 1);

    await clickTrigger();
    await click(findAll('.ember-power-select-option')[1]);

    assert.equal(this.get('selectedCountries.length'), 2);
  });

  test('it calls onCreate correctly in multiple mode', async function(assert) {
    assert.expect(1);

    this.set('selectedCountries', []);
    this.actions.createCountry = function(country) {
      assert.equal(country, 'Foo Bar');
    };

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @options={{countries}}
        @selected={{selectedCountries}}
        @onCreate={{action "createCountry"}} as |country|
      >
        {{country.name}}
      </PowerSelectMultipleWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');
    await click(findAll('.ember-power-select-option')[0]);
  });

  test('it supports async search function', async function(assert) {
    this.set('selectedCountries', []);
    this.actions.searchCountries = () => {
      return new Promise((resolve) => {
        resolve([{name: 'Foo'}, {name: 'Bar'}]);
      });
    };

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @search={{action "searchCountries"}}
        @selected={{selectedCountries}}
        @onChange={{action (mut selectedCountries)}}
        @onCreate={{action "createCountry"}} as |country|
      >
        {{country.name}}
      </PowerSelectMultipleWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('foo');
    await click(findAll('.ember-power-select-option')[1]);

    await clickTrigger();
    await typeInSearch('foo');
    await click(findAll('.ember-power-select-option')[2]);

    assert.equal(this.get('selectedCountries')[0].name, 'Foo');
    assert.equal(this.get('selectedCountries')[1].name, 'Bar');
  });
});
