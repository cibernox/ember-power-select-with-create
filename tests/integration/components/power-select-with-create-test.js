import { Promise } from 'rsvp';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
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

  test('it displays option to add item with default text', async function(assert) {
    assert.expect(1);

    await render(hbs`
      {{#power-select-with-create
          options=countries
          onCreate=(action "createCountry")
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');

    assert.dom('.ember-power-select-option').hasText('Add "Foo Bar"...');
  });

  test('it displays option to add item with default text at bottom', async function(assert) {
    assert.expect(1);

    await render(hbs`
      {{#power-select-with-create
          options=countries
          onCreate=(action "createCountry")
          showCreatePosition="bottom"
          searchField="name"
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
    `);

    await clickTrigger();
    await typeInSearch('Russ');

    const options = findAll('.ember-power-select-option');
    assert.dom(options[1]).hasText('Add "Russ"...');
  });

  test('it displays option to add item with custom text', async function(assert) {
    assert.expect(1);

    this.actions.customSuggestion = (term) => {
      return `Create ${term}`;
    };

    await render(hbs`
      {{#power-select-with-create
          options=countries
          onCreate=(action "createCountry")
          buildSuggestion=(action "customSuggestion")
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');

    assert.dom('.ember-power-select-option').hasText('Create Foo Bar');
  });


  test('it displays option to add item with custom text at bottom', async function(assert) {
    assert.expect(1);

    this.actions.customSuggestion = (term) => {
      return `Create ${term}`;
    };

    await render(hbs`
      {{#power-select-with-create
          options=countries
          onCreate=(action "createCountry")
          buildSuggestion=(action "customSuggestion")
          searchField='name'
          showCreatePosition="bottom"
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
    `);

    await clickTrigger();
    await typeInSearch('Russ');

    const options = findAll('.ember-power-select-option');
    assert.dom(options[1]).hasText('Create Russ');
  });

  test('it executes the onCreate callback', async function(assert) {
    assert.expect(1);

    this.actions.createCountry = (countryName) => {
      assert.equal(countryName, 'Foo Bar');
    };

    await render(hbs`
      {{#power-select-with-create
          options=countries
          onCreate=(action "createCountry")
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
    `);

    await clickTrigger();
    await typeInSearch('Foo Bar');
    click(findAll('.ember-power-select-option')[0]);
  });

  test('it lets the user specify a custom search action', async function(assert) {
    assert.expect(5);

    this.actions.customSearch = function(term) {
      assert.equal(term, 'Foo Bar');
      return [
        {name: 'Foo'},
        {name: 'Bar'},
      ];
    };

    await render(hbs`
      {{#power-select-with-create
          search=(action "customSearch")
          onCreate=(action "createCountry")
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
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

    this.actions.customSearch = function(term) {
      assert.equal(term, 'Foo Bar');
      return ArrayProxy.create({
        content: A([
          {name: 'Foo'},
          {name: 'Bar'},
        ])
      });
    };

    await render(hbs`
      {{#power-select-with-create
          search=(action "customSearch")
          onCreate=(action "createCountry")
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
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
    assert.expect(5);

    this.set('countries', [{name: 'Canada'}]);
    this.set('show', false);
    this.actions.shouldShowCreate = (term) => {
      assert.equal(term, 'can');
      return this.get('show');
    };

    await render(hbs`
      {{#power-select-with-create
          options=countries
          searchField="name"
          onCreate=(action "createCountry")
          showCreateWhen=(action "shouldShowCreate")
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
    `);

    await clickTrigger();
    await typeInSearch('can');
    assert.dom('.ember-power-select-option').exists({ count: 1 });
    assert.dom('.ember-power-select-option').hasText('Canada');

    this.set('show', true);

    await typeInSearch('can');
    assert.dom('.ember-power-select-option').exists({ count: 2 });
  });

  test('shouldShowCreate called with options when backed by static array', async function(assert) {
    assert.expect(1);

    const countries = [{name: 'Canada'}];
    this.set('countries', countries);
    this.actions.shouldShowCreate = (term, options) => {
      assert.deepEqual(options, countries);
      return true;
    };

    await render(hbs`
      {{#power-select-with-create
          options=countries
          searchField="name"
          onCreate=(action "createCountry")
          showCreateWhen=(action "shouldShowCreate")
          renderInPlace=true as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
    `);

    await clickTrigger();
    typeInSearch('can');
  });

  test('shouldShowCreate called with options when backed by async search', async function(assert) {
    assert.expect(1);

    const countries = [{name: 'Canada'}];
    this.actions.searchCountries = () => {
      return new Promise((resolve) => {
        resolve(countries);
      });
    };

    this.actions.shouldShowCreate = (term, options) => {
      assert.deepEqual(options, countries);
      return true;
    };

    await render(hbs`
      {{#power-select-with-create
          search=(action "searchCountries")
          onChange=(action (mut selectedCountries))
          onCreate=(action "createCountry")
          showCreateWhen=(action "shouldShowCreate")
          renderInPlace=true
           as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
    `);

    await clickTrigger();
    await typeInSearch('can');
  });

  test('shouldShowCreate works with async search', async function(assert) {
    assert.expect(5);

    this.set('selectedCountries', []);
    this.set('show', true);
    this.actions.searchCountries = () => {
      return new Promise((resolve) => {
        resolve([{name: 'Foo'}, {name: 'Bar'}]);
      });
    };

    this.actions.shouldShowCreate = (term) => {
      assert.equal(term, 'can');
      return this.get('show');
    };

    await render(hbs`
      {{#power-select-with-create
          search=(action "searchCountries")
          selected=selectedCountries
          onChange=(action (mut selectedCountries))
          onCreate=(action "createCountry")
          showCreateWhen=(action "shouldShowCreate")
          renderInPlace=true
           as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
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

    this.set('selectedCountries', []);
    this.set('show', true);
    this.actions.searchCountries = () => {
      return new Promise((resolve) => {
        resolve([{name: 'Foo'}, {name: 'Bar'}]);
      });
    };

    this.actions.shouldShowCreate = (term) => {
      assert.equal(term, 'can');
      return this.get('show');
    };

    await render(hbs`
      {{#power-select-with-create
          search=(action "searchCountries")
          selected=selectedCountries
          onChange=(action (mut selectedCountries))
          onCreate=(action "createCountry")
          showCreateWhen=(action "shouldShowCreate")
          showCreatePosition='bottom'
          renderInPlace=true
           as |country|
      }}
        {{country.name}}
      {{/power-select-with-create}}
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
    this.set('selectedCountries', []);
    this.actions.searchCountries = () => {
      return new Promise((resolve) => {
        resolve([portugal, spain]);
      });
    };

    this.actions.createCountry = (countryName) => {
      let newCountry = run(() => store.createRecord({ name: countryName, code: 'XX', population: 'unknown'}));
      this.get('selectedCountries').pushObject(newCountry);
    };

    await render(hbs`
      {{#power-select-multiple-with-create
          search=(action "searchCountries")
          selected=selectedCountries
          onChange=(action (mut selectedCountries))
          searchField='name'
          onCreate=(action "createCountry") as |country|
      }}
        {{country.name}}
      {{/power-select-multiple-with-create}}
    `);

    await clickTrigger();
    await typeInSearch('Foo');
    const options = findAll('.ember-power-select-option');
    assert.equal(options.length, 3);
    assert.dom(options[0]).hasText('Add "Foo"...');
    assert.dom(options[1]).hasText('Portugal');
    assert.dom(options[2]).hasText('Spain');
  });


});
