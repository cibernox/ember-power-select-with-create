import Ember from 'ember';
import layout from '../templates/components/power-select-with-create';
import { filterOptions, defaultMatcher } from 'ember-power-select/utils/group-utils';
const { computed, get, RSVP } = Ember;

export default Ember.Component.extend({
  tagName: '',
  layout: layout,
  matcher: defaultMatcher,
  suggestedOptionComponent: 'power-select-with-create/suggested-option',
  powerSelectComponentName: 'power-select',

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
    if (selection.__isSuggestion__) {
      this.get('oncreate')(selection.__value__, select);
    } else {
      this.get('onchange')(selection, select);
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
