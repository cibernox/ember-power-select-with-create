import Ember from 'ember';
import layout from '../templates/components/power-select-with-create';
import { filterOptions, defaultMatcher } from 'ember-power-select/utils/group-utils';
const { computed, get, RSVP } = Ember;

export default Ember.Component.extend({
  tagName: '',
  layout: layout,
  matcher: defaultMatcher,
  yieldCreateOption: false,
  isSuggestionField: '__isSuggestion__',

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

  addCreateOption(term, results){
    if (this.shouldShowCreateOption(term, results)) {
      if(this.get('showCreatePosition') === 'bottom'){
        results.push(this.buildSuggestionForTerm(term));
      }
      else {
        results.unshift(this.buildSuggestionForTerm(term));
      }
    }
  },
  // Actions
  actions: {
    searchAndSuggest(term, select) {
      return RSVP.resolve(this.get('optionsArray')).then(newOptions => {

        if (term.length === 0) {
          return newOptions;
        }

        let searchAction = this.get('search');
        if (searchAction) {
          return Ember.RSVP.resolve(searchAction(term, select)).then((results) =>  {
            if (results.toArray) {
              results = results.toArray();
            }
            this.addCreateOption(term, results);
            return results;
          });
        }

        newOptions = this.filter(Ember.A(newOptions), term);
        this.addCreateOption(term, newOptions);

        return newOptions;
      });
    },

    selectOrCreate(selection, select) {
      let suggestion;
      let isSuggestionField = this.get('isSuggestionField');

      if (this.get('multiple')) {
        suggestion = selection.filter((option) => {
          return option[isSuggestionField];
        })[0];
      } else if (selection && selection[isSuggestionField]) {
        suggestion = selection;
      }

      if (suggestion) {
        this.get('oncreate')(suggestion.__value__, select);
      } else {
        this.get('onchange')(selection, select);
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
    let suggestion = {
      __value__: term,
      text: this.buildSuggestionLabel(term),
    };

    suggestion[this.get('isSuggestionField')] = true;

    return suggestion;
  },

  buildSuggestionLabel(term) {
    let buildSuggestion = this.get('buildSuggestion');
    if (buildSuggestion) {
      return buildSuggestion(term);
    }
    return `Add "${term}"...`;
  }
});
