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
    let options = this.get('options');
    if (!options) { return Ember.A(); }
    if (options.then) {
      return options.then(value => Ember.A(value).toArray());
    } else {
      return Ember.A(options).toArray();
    }
  }),

  powerSelectComponentName: computed('multiple', function() {
    return this.get('multiple') ? 'power-select-multiple' : 'power-select';
  }),

  shouldShowCreateOption(term, options) {
    return this.get('showCreateWhen') ? this.get('showCreateWhen')(term, options) : true;
  },

  // Actions
  actions: {
    searchAndSuggest(term) {
      let newOptions = this.get('optionsArray');

      if (term.length === 0) {
        return newOptions;
      }

      if (this.get('search')) {
        return Ember.RSVP.resolve(this.get('search')(term)).then((results) =>  {
          if (results.toArray) {
            results = results.toArray();
          }

          if (this.shouldShowCreateOption(term, results)) {
            results.unshift(this.buildSuggestionForTerm(term));
          }

          return results;
        });
      }

      newOptions = this.filter(Ember.A(newOptions), term);
      if (this.shouldShowCreateOption(term, newOptions)) {
        newOptions.unshift(this.buildSuggestionForTerm(term));
      }

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
