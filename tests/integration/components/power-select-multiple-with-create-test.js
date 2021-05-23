import { Promise } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { typeInSearch, clickTrigger } from 'ember-power-select/test-support/helpers';
import { findAll, click } from '@ember/test-helpers';
import { set } from '@ember/object';

module('Integration | Component | power select with create', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.countries = [
      { name: 'United States',  code: 'US', population: 321853000 },
      { name: 'Spain',          code: 'ES', population: 46439864 },
      { name: 'Portugal',       code: 'PT', population: 10374822 },
      { name: 'Russia',         code: 'RU', population: 146588880 },
      { name: 'Latvia',         code: 'LV', population: 1978300 },
      { name: 'Brazil',         code: 'BR', population: 204921000 },
      { name: 'United Kingdom', code: 'GB', population: 64596752 },
    ];

    this.createCountry = (countryName) => {
      let newCountry = {name: countryName, code: 'XX', population: 'unknown'};
      this.countries.push(newCountry);
    };
  });

  test('it displays multiple selections correctly', async function(assert) {
    assert.expect(2);

    const initialSelection = [this.countries[0]];
    this.selectedCountries = initialSelection;

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @options={{this.countries}}
        @selected={{selectedCountries}}
        @onChange={{action (mut selectedCountries)}}
        @onCreate={{this.createCountry}} as |country|
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

    this.selectedCountries = [];
    this.selectCountries = (countries) => {
      assert.ok(countries instanceof Array);
      set(this, "selectedCountries", countries);
    };

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @options={{this.countries}}
        @selected={{this.selectedCountries}}
        @onChange={{this.selectCountries}}
        @onCreate={{this.createCountry}} as |country|
      >
        {{country.name}}
      </PowerSelectMultipleWithCreate>
    `);

    await clickTrigger();
    await click(findAll('.ember-power-select-option')[0]);

    assert.equal(this.selectedCountries.length, 1);

    await clickTrigger();
    await click(findAll('.ember-power-select-option')[1]);

    assert.equal(this.selectedCountries.length, 2);
  });

  test('it calls onCreate correctly in multiple mode', async function(assert) {
    assert.expect(1);

    this.selectedCountries = [];
    this.createCountry = (country) => {
      assert.equal(country, 'Foo Bar');
    };

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @options={{this.countries}}
        @selected={{this.selectedCountries}}
        @onCreate={{this.createCountry}} as |country|
      >
        {{country.name}}
      </PowerSelectMultipleWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');
    await click(findAll('.ember-power-select-option')[0]);
  });

  test('it supports async search function', async function(assert) {
    this.selectedCountries = [];
    this.searchCountries = () => {
      return new Promise((resolve) => {
        resolve([{name: 'Foo'}, {name: 'Bar'}]);
      });
    };

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @search={{this.searchCountries}}
        @selected={{this.selectedCountries}}
        @onChange={{action (mut selectedCountries)}}
        @onCreate={{this.createCountry}} as |country|
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

    assert.equal(this.selectedCountries[0].name, 'Foo');
    assert.equal(this.selectedCountries[1].name, 'Bar');
  });
});
