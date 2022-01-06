import { assert } from '@ember/debug';
import Component from '@glimmer/component';
import { get, action } from '@ember/object';
import RSVP, { resolve } from 'rsvp';
import { filterOptions, defaultMatcher } from 'ember-power-select/utils/group-utils';

export default class PowerSelectWithCreateComponent extends Component {
  powerSelectComponentName = 'power-select';

  get suggestedOptionComponentWithFallback() {
    if (typeof this.args.suggestedOptionComponent !== 'undefined') {
      return this.args.suggestedOptionComponent;
    }
    return 'power-select-with-create/suggested-option';
  }

  get searchEnabledWithFallback() {
    if (typeof this.args.searchEnabled !== 'undefined') {
      return this.args.searchEnabled;
    }
    return true;
  }

  get matcherWithFallback() {
    if (typeof this.args.matcher !== 'undefined') {
      return this.args.matcher;
    }
    return defaultMatcher;
  }

  // Lifecycle hooks
  constructor() {
    super(...arguments);
    assert('<PowerSelectWithCreate> requires an `onCreate` function', this.args.onCreate && typeof this.args.onCreate === 'function');

    if (this.args.suggestedOptionComponent) {
      this.suggestedOptionComponent = this.args.suggestedOptionComponent;
    }
  }

  shouldShowCreateOption(term, options) {
    return this.args.showCreateWhen ? this.args.showCreateWhen(term, options) : true;
  }

  addCreateOption(term, results) {
    if (this.shouldShowCreateOption(term, results)) {
      if(this.args.showCreatePosition === 'bottom'){
        results.push(this.buildSuggestionForTerm(term));
      } else {
        results.unshift(this.buildSuggestionForTerm(term));
      }
    }
  }

  @action
  searchAndSuggest(term, select) {
    return RSVP.resolve(this.args.options).then(newOptions => {

      if (term.length === 0) {
        return newOptions;
      }

      let searchAction = this.args.search;
      if (searchAction) {
        return resolve(searchAction(term, select)).then((results) =>  {
          if (results.toArray) {
            results = results.toArray();
          }
          this.addCreateOption(term, results);
          return results;
        });
      }

      newOptions = this.filter(newOptions, term);
      this.addCreateOption(term, newOptions);
      return newOptions;
    });
  }

  @action
  selectOrCreate(selection, select, e) {
    if (selection && selection.__isSuggestion__) {
      this.args.onCreate(selection.__value__, select, e);
    } else {
      this.args.onChange(selection, select, e);
    }
  }

  // Methods
  filter(options, searchText) {
    let matcher;
    if (this.args.searchField) {
      matcher = (option, text) => this.matcher(get(option, this.args.searchField), text);
    } else {
      matcher = (option, text) => this.matcher(option, text);
    }
    return filterOptions(options || [], searchText, matcher);
  }

  buildSuggestionForTerm(term) {
    return {
      __isSuggestion__: true,
      __value__: term,
      text: this.buildSuggestionLabel(term),
    };
  }

  buildSuggestionLabel(term) {
    if (this.args.buildSuggestion) {
      return this.args.buildSuggestion(term);
    }

    return `Add "${term}"...`;
  }
}
