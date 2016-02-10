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
    if (!this.get('options')) {
      return [];
    }
    return Ember.A(this.get('options')).toArray();
  }),

  // Actions
  actions: {
    searchAndSuggest(term) {
      let newOptions = this.get('optionsArray');
      let lowerCaseTerm = term.toLowerCase();

      if (term.length === 0) {
        return newOptions;
      }

      if (this.get('search')) {
        return Ember.RSVP.resolve(this.get('search')(term)).then((results) =>  {
          let match = results.some(result => result.get(this.get('searchField')).toLowerCase() === lowerCaseTerm);

          if (match) {
            return results;
          } else {
            results.unshift(this.buildSuggestionForTerm(term));
            return results;
          }
        });
      }

      newOptions = this.filter(Ember.A(newOptions), term);
      newOptions.unshift(this.buildSuggestionForTerm(term));
      return newOptions;
    },

    selectOrCreate(selection) {
      let suggestion;
      if (this.get('multiple')) {
        suggestion = selection.filter((option) => {
          return option.__isSuggestion__;
        })[0];
      } else if (selection && selection.__isSuggestion__) {
        suggestion = selection;
      }

      if (suggestion) {
        this.get('oncreate')(suggestion.__value__);
      } else {
        this.get('onchange')(selection);
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
