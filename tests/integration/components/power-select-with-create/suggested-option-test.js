import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('power-select-with-create/suggested-option', 'Integration | Component | power select with create/suggested option', {
  integration: true
});

test('it displays the suggested text', function(assert) {
  let term = 'Russ';
  let option = {
    __isSuggestion__: true,
    __value__: term,
    text: `Add "${term}"...`
  };

  this.set('term', term);
  this.set('option', option);
  this.render(hbs`{{power-select-with-create/suggested-option option=option term=term}}`);

  assert.equal(this.$().text().trim(), `Add "${term}"...`);
});
