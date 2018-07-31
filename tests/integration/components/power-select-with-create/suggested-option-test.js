import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | power select with create/suggested option', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays the suggested text', async function(assert) {
    let term = 'Russ';
    let option = {
      __isSuggestion__: true,
      __value__: term,
      text: `Add "${term}"...`
    };

    this.set('term', term);
    this.set('option', option);
    await render(hbs`{{power-select-with-create/suggested-option option=option term=term}}`);

    assert.dom(this.element).hasText(`Add "${term}"...`);
  });
});
