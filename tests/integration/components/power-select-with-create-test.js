import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { typeInSearch } from '../../helpers/ember-power-select';

moduleForComponent('power-select-with-create', 'Integration | Component | power select with create', {
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

test('it displays option to add item with default text', function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        oncreate=(action "createCountry")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  Ember.run(() => this.$('.ember-power-select-trigger').mousedown());
  Ember.run(() => typeInSearch('Foo Bar'));

  assert.equal(
    this.$('.ember-power-select-option:eq(0)').text().trim(),
    'Add "Foo Bar"...'
  );
});

test('it displays option to add item with custom text', function(assert) {
  assert.expect(1);

  this.on('customSuggestion', (term) => {
    return `Create ${term}`;
  });

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        oncreate=(action "createCountry")
        buildSuggestion=(action "customSuggestion")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  Ember.run(() => this.$('.ember-power-select-trigger').mousedown());
  Ember.run(() => typeInSearch('Foo Bar'));

  assert.equal(
    this.$('.ember-power-select-option:eq(0)').text().trim(),
    'Create Foo Bar'
  );
});

test('it executes the oncreate callback', function(assert) {
  assert.expect(1);

  this.on('createCountry', (countryName) => {
    assert.equal(countryName, 'Foo Bar');
  });

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        oncreate=(action "createCountry")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  Ember.run(() => this.$('.ember-power-select-trigger').mousedown());
  Ember.run(() => typeInSearch('Foo Bar'));
  Ember.run(() => $('.ember-power-select-option:eq(0)').mouseup());
});

test('it lets the user specify a custom search action', function(assert) {
  assert.expect(5);

  this.on('customSearch', function(term) {
    assert.equal(term, 'Foo Bar');
    return [
      {name: 'Foo'},
      {name: 'Bar'},
    ];
  });

  this.render(hbs`
    {{#power-select-with-create
        search=(action "customSearch")
        oncreate=(action "createCountry")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  Ember.run(() => this.$('.ember-power-select-trigger').mousedown());
  Ember.run(() => typeInSearch('Foo Bar'));

  const options = this.$('.ember-power-select-option');
  assert.equal(options.length, 3);
  assert.equal(options.eq(0).text().trim(), 'Add "Foo Bar"...');
  assert.equal(options.eq(1).text().trim(), 'Foo');
  assert.equal(options.eq(2).text().trim(), 'Bar');
});
