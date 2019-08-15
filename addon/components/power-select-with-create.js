import { A } from '@ember/array';
import { assert } from '@ember/debug';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import RSVP, { resolve } from 'rsvp';
import layout from '../templates/components/power-select-with-create';
import { filterOptions, defaultMatcher } from 'ember-power-select/utils/group-utils';

export default Component.extend({
  tagName: '',
  layout: layout,
  matcher: defaultMatcher,
  suggestedOptionComponent: 'power-select-with-create/suggested-option',
  powerSelectComponentName: 'power-select',
  lastSearchTerm: null,

  // Lifecycle hooks
  init() {
    this._super(...arguments);
    assert('{{power-select-with-create}} requires an `oncreate` function', this.get('oncreate') && typeof this.get('oncreate') === 'function');
  },

  // CPs
  optionsArray: computed('options.[]', function() {
    let options = this.get('options');
    if (!options) { return A(); }
    if (options.then) {
      return options.then(value => A(value).toArray());
    } else {
      return A(options).toArray();
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
    this.set('lastSearchTerm', term);
    return RSVP.resolve(this.get('optionsArray')).then(newOptions => {

      if (term.length === 0) {
        return newOptions;
      }

      let searchAction = this.get('search');
      if (searchAction) {
        return resolve(searchAction(term, select)).then((results) =>  {
          if (results.toArray) {
            results = results.toArray();
          }
          this.addCreateOption(term, results);
          return results;
        });
      }

      newOptions = this.filter(A(newOptions), term);
      this.addCreateOption(term, newOptions);

      return newOptions;
    });
  },

  selectOrCreate(selection, select, e) {
    if (selection && selection.__isSuggestion__) {
      this.get('oncreate')(selection.__value__, select, e);
    } else {
      this.get('onchange')(selection, select, e);
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
  },

  optionsChanged: Ember.observer('optionsArray', function() {
    if (!this.get('alwaysShowCreate') || !this.get('lastSearchTerm')) {
      return;
    }

    this.addCreateOption(this.get('lastSearchTerm'), this.get('optionsArray'));
  }),

  selectedChanged: Ember.observer('selected', function() {
    if (!this.get('alwaysShowCreate')) {
      return;
    }

    this.set('lastSearchTerm', null);

    const options = this.get('options');
    this.set('options', null);
    this.set('options', options);
  })
});
