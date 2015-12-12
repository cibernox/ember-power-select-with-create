import Ember from 'ember';
import layout from '../templates/components/power-select-with-create';
import { filterOptions, defaultMatcher } from 'ember-power-select/utils/group-utils';
const { computed, get } = Ember;

export default Ember.Component.extend({
  tagName: '',
  layout: layout,
  matcher: defaultMatcher,

  // Lifecycle hooks
  init() {
    this._super(...arguments);
    Ember.assert('{{power-select-with-create}} requires an `oncreate` function', this.get('oncreate') && typeof this.get('oncreate') === 'function');
  },

  // CPs
  optionsArray: computed('options.[]', function() {
    return Ember.A(this.get('options')).toArray();
  }),

  // Actions
  actions: {
    searchAndSuggest(term) {
      let newOptions = this.get('optionsArray');

      if (term.length === 0) {
        return newOptions;
      }

      if (this.get('search')) {
        return Ember.RSVP.resolve(this.get('search')(term)).then((results) =>  {
          results.unshift(this.buildSuggestionForTerm(term));
          return results;
        });
      }

      newOptions = this.filter(Ember.A(newOptions), term);
      newOptions.unshift(this.buildSuggestionForTerm(term));
      return newOptions;
    },

    selectOrCreate(option) {
      if (option && option.__isSuggestion__) {
        this.get('oncreate')(option.__value__);
      } else {
        this.get('onchange')(option);
      }
    }
  },

  // Methods
  filter(options, searchText) {
    let matcher;
    if (this.get('searchField')) {
      matcher = (option, text) => this.matcher(get(option, this.get('searchField')), text);
    } else {
      matcher = (option, text) => this.matcher(option, text);
    }
    return filterOptions(options || [], searchText, matcher);
  },

  buildSuggestionForTerm(term) {
    return {
      __isSuggestion__: true,
      __value__: term,
      text: this.buildSuggestionLabel(term),
    };
  },

  buildSuggestionLabel(term) {
    let buildSuggestion = this.get('buildSuggestion');
    if (buildSuggestion) {
      return buildSuggestion(term);
    }
    return `Add "${term}"...`;
  }
});
