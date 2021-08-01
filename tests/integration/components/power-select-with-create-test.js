import { Promise } from 'rsvp';
import Component from '@ember/component';
import ArrayProxy from '@ember/array/proxy';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from "@ember/test-helpers";
import hbs from 'htmlbars-inline-precompile';
import { typeInSearch, clickTrigger } from 'ember-power-select/test-support/helpers';
import { findAll, click } from '@ember/test-helpers';

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

  test('it displays option to add item with default text', async function(assert) {
    assert.expect(1);

    await render(hbs`
      <PowerSelectWithCreate
        @options={{this.countries}}
        @onCreate={{this.createCountry}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');

    assert.dom('.ember-power-select-option').hasText('Add "Foo Bar"...');
  });

  test('it displays option to add item with default text at bottom', async function(assert) {
    assert.expect(1);

    await render(hbs`
      <PowerSelectWithCreate
        @options={{this.countries}}
        @onCreate={{this.createCountry}}
        @showCreatePosition="bottom"
        @searchField="name"
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Russ');

    const options = findAll('.ember-power-select-option');
    assert.dom(options[1]).hasText('Add "Russ"...');
  });

  test('it displays option to add item with custom text', async function(assert) {
    assert.expect(1);

    this.customSuggestion = (term) => {
      return `Create ${term}`;
    };

    await render(hbs`
      <PowerSelectWithCreate
        @options={{this.countries}}
        @onCreate={{this.createCountry}}
        @buildSuggestion={{this.customSuggestion}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');

    assert.dom('.ember-power-select-option').hasText('Create Foo Bar');
  });


  test('it displays option to add item with custom text at bottom', async function(assert) {
    assert.expect(1);

    this.customSuggestion = (term) => {
      return `Create ${term}`;
    };

    await render(hbs`
      <PowerSelectWithCreate
        @options={{this.countries}}
        @onCreate={{this.createCountry}}
        @buildSuggestion={{this.customSuggestion}}
        @searchField="name"
        @showCreatePosition="bottom"
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Russ');

    const options = findAll('.ember-power-select-option');
    assert.dom(options[1]).hasText('Create Russ');
  });

  test('it executes the onCreate callback', async function(assert) {
    assert.expect(1);

    this.createCountry = (countryName) => {
      assert.equal(countryName, 'Foo Bar');
    };

    await render(hbs`
      <PowerSelectWithCreate
        @options={{this.countries}}
        @onCreate={{this.createCountry}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');
    click(findAll('.ember-power-select-option')[0]);
  });

  test('it lets the user specify a custom search action', async function(assert) {
    assert.expect(5);

    this.customSearch = (term) => {
      assert.equal(term, 'Foo Bar');
      return [
        {name: 'Foo'},
        {name: 'Bar'},
      ];
    };

    await render(hbs`
      <PowerSelectWithCreate
        @search={{this.customSearch}}
        @onCreate={{this.createCountry}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');

    const options = findAll('.ember-power-select-option');
    assert.equal(options.length, 3);
    assert.dom(options[0]).hasText('Add "Foo Bar"...');
    assert.dom(options[1]).hasText('Foo');
    assert.dom(options[2]).hasText('Bar');
  });

  test('async search works with an ArrayProxy', async function(assert) {
    assert.expect(5);

    this.customSearch = (term) => {
      assert.equal(term, 'Foo Bar');
      return ArrayProxy.create({
        content: [
          {name: 'Foo'},
          {name: 'Bar'},
        ]
      });
    };

    await render(hbs`
      <PowerSelectWithCreate
        @search={{this.customSearch}}
        @onCreate={{this.createCountry}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');

    const options = findAll('.ember-power-select-option');
    assert.equal(options.length, 3);
    assert.dom(options[0]).hasText('Add "Foo Bar"...');
    assert.dom(options[1]).hasText('Foo');
    assert.dom(options[2]).hasText('Bar');
  });

  test('it lets the user decide if the create option should be shown', async function(assert) {
    assert.expect(3);

    this.countries = [{name: 'Canada'}];
    this.show = false;
    this.createCountry = () => {};
    this.shouldShowCreate = () => {
      return this.show;
    };

    await render(hbs`
      <PowerSelectWithCreate
        @options={{this.countries}}
        @searchField="name"
        @onCreate={{this.createCountry}}
        @showCreateWhen={{this.shouldShowCreate}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('can');
    assert.dom('.ember-power-select-option').exists({ count: 1 });
    assert.dom('.ember-power-select-option').hasText('Canada');

    this.set('show', true);

    await typeInSearch('cana');
    assert.dom('.ember-power-select-option').exists({ count: 2 });
  });

  test('shouldShowCreate called with options when backed by static array', async function(assert) {
    assert.expect(1);

    const countries = [{name: 'Canada'}];
    this.countries = countries;
    this.shouldShowCreate = (term, options) => {
      assert.deepEqual(options, countries);
      return true;
    };

    await render(hbs`
      <PowerSelectWithCreate
        @options={{this.countries}}
        @searchField="name"
        @onCreate={{this.createCountry}}
        @showCreateWhen={{this.shouldShowCreate}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    typeInSearch('can');
  });

  test('shouldShowCreate called with options when backed by async search', async function(assert) {
    assert.expect(1);

    const countries = [{name: 'Canada'}];
    this.searchCountries = () => {
      return new Promise((resolve) => {
        resolve(countries);
      });
    };

    this.shouldShowCreate = (term, options) => {
      assert.deepEqual(options, countries);
      return true;
    };

    await render(hbs`
      <PowerSelectWithCreate
        @search={{this.searchCountries}}
        @onChange={{action (mut this.selectedCountries)}}
        @onCreate={{this.createCountry}}
        @showCreateWhen={{this.shouldShowCreate}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('can');
  });

  test('shouldShowCreate works with async search', async function(assert) {
    assert.expect(5);

    this.selectedCountries = [];
    this.show = true;
    this.searchCountries = () => {
      return new Promise((resolve) => {
        resolve([{name: 'Foo'}, {name: 'Bar'}]);
      });
    };

    this.shouldShowCreate = (term) => {
      assert.equal(term, 'can');
      return this.show;
    };

    await render(hbs`
      <PowerSelectWithCreate
        @search={{this.searchCountries}}
        @selected={{this.selectedCountries}}
        @onChange={{action (mut selectedCountries)}}
        @onCreate={{this.createCountry}}
        @showCreateWhen={{this.shouldShowCreate}}
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('can');

    const options = findAll('.ember-power-select-option');
    assert.equal(options.length, 3);
    assert.dom(options[0]).hasText('Add "can"...');
    assert.dom(options[1]).hasText('Foo');
    assert.dom(options[2]).hasText('Bar');
  });


  test('showCreatePosition works with async search', async function(assert) {
    assert.expect(5);

    this.selectedCountries = [];
    this.show = true;
    this.searchCountries = () => {
      return new Promise((resolve) => {
        resolve([{name: 'Foo'}, {name: 'Bar'}]);
      });
    };

    this.shouldShowCreate = (term) => {
      assert.equal(term, 'can');
      return this.show;
    };

    await render(hbs`
      <PowerSelectWithCreate
        @search={{this.searchCountries}}
        @selected={{this.selectedCountries}}
        @onChange={{action (mut selectedCountries)}}
        @onCreate={{this.createCountry}}
        @showCreateWhen={{this.shouldShowCreate}}
        @showCreatePosition="bottom"
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('can');

    const options = findAll('.ember-power-select-option');
    assert.equal(options.length, 3);
    assert.dom(options[2]).hasText('Add "can"...');
    assert.dom(options[0]).hasText('Foo');
    assert.dom(options[1]).hasText('Bar');
  });

  test('it supports async search function with ember-data-models', async function(assert) {
    let store = this.owner.lookup('service:store');
    let portugal = run(() => store.createRecord('country', {
      code: 'pt',
      name: 'Portugal',
      population: 10000
    }));
    let spain = run(() => store.createRecord('country', {
      code: 'es',
      name: 'Spain',
      population: 20000
    }));
    this.selectedCountries = [];
    this.searchCountries = () => {
      return new Promise((resolve) => {
        resolve([portugal, spain]);
      });
    };

    this.createCountry = (countryName) => {
      let newCountry = run(() => store.createRecord({ name: countryName, code: 'XX', population: 'unknown'}));
      this.selectedCountries.pushObject(newCountry);
    };

    await render(hbs`
      <PowerSelectMultipleWithCreate
        @search={{this.searchCountries}}
        @selected={{this.selectedCountries}}
        @onChange={{action (mut selectedCountries)}}
        @searchField="name"
        @onCreate={{this.createCountry}} as |country|
      >
        {{country.name}}
      </PowerSelectMultipleWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo');
    const options = findAll('.ember-power-select-option');
    assert.equal(options.length, 3);
    assert.dom(options[0]).hasText('Add "Foo"...');
    assert.dom(options[1]).hasText('Portugal');
    assert.dom(options[2]).hasText('Spain');
  });

  test('selected option can be customized using triggerComponent', async function(assert) {
    assert.expect(3);

    this.owner.register('component:selected-country', class extends Component {
      layout = hbs`
        <img src={{select.selected.flagUrl}} class="icon-flag {{if extra.coolFlagIcon "cool-flag-icon"}}" alt="Flag of {{select.selected.name}}">
        {{select.selected.name}}
      `
    });

    this.country = this.countries[1]; // Spain

    await render(hbs`
      <PowerSelectWithCreate
        @selected={{country}}
        @options={{this.countries}}
        @triggerComponent="selected-country"
        @onCreate={{this.createCountry}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    assert.dom('.ember-power-select-status-icon').doesNotExist('The provided trigger component is not rendered');
    assert.dom('.ember-power-select-trigger .icon-flag').exists('The custom flag appears.');
    assert.dom('.ember-power-select-trigger').hasText('Spain', 'With the country name as the text.');
  });


  test('it accepts a suggestedOptionComponent', async function(assert) {
    assert.expect(1);

    await render(hbs`
      <PowerSelectWithCreate
        @options={{this.countries}}
        @onCreate={{this.createCountry}}
        @suggestedOptionComponent="custom-suggested-option"
        @renderInPlace={{true}} as |country|
      >
        {{country.name}}
      </PowerSelectWithCreate>
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');

    assert.dom('.ember-power-select-option').hasText('Custom Component Foo Bar');
  });
});
