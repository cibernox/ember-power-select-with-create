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

    this.term = term;
    this.option = option;
    await render(hbs`
      <PowerSelectWithCreate::SuggestedOption @option={{this.option}} @term={{this.term}} />
    `);

    assert.dom(this.element).hasText(`Add "${term}"...`);
  });
});
