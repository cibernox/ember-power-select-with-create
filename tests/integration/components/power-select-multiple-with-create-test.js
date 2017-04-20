import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { typeInSearch, clickTrigger } from '../../helpers/ember-power-select';
import { findAll, click } from 'ember-native-dom-helpers';

moduleForComponent('power-select-multiple-with-create', 'Integration | Component | power select with create', {
  integration: true,

  beforeEach: function() {
    this.set('countries', Ember.A([
      { name: 'United States',  code: 'US', population: 321853000 },
      { name: 'Spain',          code: 'ES', population: 46439864 },
      { name: 'Portugal',       code: 'PT', population: 10374822 },
      { name: 'Russia',         code: 'RU', population: 146588880 },
      { name: 'Latvia',         code: 'LV', population: 1978300 },
      { name: 'Brazil',         code: 'BR', population: 204921000 },
      { name: 'United Kingdom', code: 'GB', population: 64596752 },
    ]));
    this.on('createCountry', (countryName) => {
      let newCountry = {name: countryName, code: 'XX', population: 'unknown'};
      this.get('countries').pushObject(newCountry);
    });
  },
});

test('it displays multiple selections correctly', function(assert) {
  assert.expect(2);

  const initialSelection = [this.get('countries.firstObject')];
  this.set('selectedCountries', initialSelection);

  this.render(hbs`
    {{#power-select-multiple-with-create
        options=countries
        selected=selectedCountries
        onchange=(action (mut selectedCountries))
        oncreate=(action "createCountry") as |country|
    }}
      {{country.name}}
    {{/power-select-multiple-with-create}}
  `);

  const selectedOptions = findAll('.ember-power-select-multiple-option');
  assert.equal(selectedOptions.length, initialSelection.length);
  assert.ok(selectedOptions[0].textContent.trim().indexOf(initialSelection[0].name) !== -1);
});

test('it passes an array to onchange in multiple mode', function(assert) {
  assert.expect(4);

  this.set('selectedCountries', []);
  this.on('selectCountries', function(countries) {
    assert.ok(countries instanceof Array);
    this.set('selectedCountries', countries);
  });

  this.render(hbs`
    {{#power-select-multiple-with-create
        options=countries
        selected=selectedCountries
        onchange=(action "selectCountries")
        oncreate=(action "createCountry") as |country|
    }}
      {{country.name}}
    {{/power-select-multiple-with-create}}
  `);

  clickTrigger();
  click(findAll('.ember-power-select-option')[0]);

  assert.equal(this.get('selectedCountries.length'), 1);

  clickTrigger();
  click(findAll('.ember-power-select-option')[1]);

  assert.equal(this.get('selectedCountries.length'), 2);
});

test('it calls oncreate correctly in multiple mode', function(assert) {
  assert.expect(1);

  this.set('selectedCountries', []);
  this.on('createCountry', function(country) {
    assert.equal(country, 'Foo Bar');
  });

  this.render(hbs`
    {{#power-select-multiple-with-create
        options=countries
        selected=selectedCountries
        oncreate=(action "createCountry") as |country|
    }}
      {{country.name}}
    {{/power-select-multiple-with-create}}
  `);

  clickTrigger();
  Ember.run(() => typeInSearch('Foo Bar'));
  click(findAll('.ember-power-select-option')[0]);
});

test('it supports async search function', function(assert) {
  this.set('selectedCountries', []);
  this.on('searchCountries', () => {
    return new Ember.RSVP.Promise((resolve) => {
      resolve([{name: 'Foo'}, {name: 'Bar'}]);
    });
  });

  this.render(hbs`
    {{#power-select-multiple-with-create
        search=(action "searchCountries")
        selected=selectedCountries
        onchange=(action (mut selectedCountries))
        oncreate=(action "createCountry") as |country|
    }}
      {{country.name}}
    {{/power-select-multiple-with-create}}
  `);

  clickTrigger();
  typeInSearch('foo');
  click(findAll('.ember-power-select-option')[1]);

  clickTrigger();
  typeInSearch('foo');
  click(findAll('.ember-power-select-option')[2]);

  assert.equal(this.get('selectedCountries')[0].name, 'Foo');
  assert.equal(this.get('selectedCountries')[1].name, 'Bar');
});
