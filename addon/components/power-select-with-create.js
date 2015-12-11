import Ember from 'ember';
import layout from '../templates/components/power-select-with-create';
const { computed, isBlank } = Ember;

export default Ember.Component.extend({
  tagName: '',
  layout: layout,

  // Lifecycle hooks
  init() {
    this._super(...arguments);
    this.suggestion = { __id__: '__suggestion__', value: '' };
    Ember.assert('{{power-select}} requires an `oncreate` function', this.get('oncreate') && typeof this.get('oncreate') === 'function');
  },

  // CPs
  optionsArray: computed('options.[]', 'searchTerm', 'labelPath', function() {
    const { searchTerm, suggestion, labelPath } = this.getProperties('searchTerm', 'suggestion', 'labelPath');
    const optionsAry = Ember.A(this.get('options')).toArray();
    if (isBlank) {
      return optionsAry;
    }
    suggestion.value = searchTerm;
    suggestion[labelPath] = `Add "${searchTerm}"`;
    optionsAry.unshift(suggestion);
    return optionsAry;
  }),

  // Actions
  actions: {
    searchAndSuggest(term) {
      let newOptions;
      if (term.length > 0) {
        newOptions = this.get('optionsArray').filter(e => e.name.indexOf(term) > -1);
        newOptions.unshift({ __id__: '__suggestion__', __value__: term, name: this.buildSuggestionLabel(term) });
      } else {
        newOptions = this.get('optionsArray');
      }
      return newOptions;
    },

    selectOrCreate(option) {
      if (option && option.__id__ === '__suggestion__') {
        this.get('oncreate')(option.__value__);
      } else {
        this.get('onchange')(option);
      }
    }
  },

  // Methods
  buildSuggestionLabel(term) {
    let buildSuggestion = this.get('buildSuggestion');
    if (buildSuggestion) {
      return buildSuggestion(term);
    }
    return `Add "${term}"...`;
  }
});
