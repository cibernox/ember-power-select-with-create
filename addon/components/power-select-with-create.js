import Component from '@glimmer/component';
import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { action, get } from '@ember/object';
import RSVP, { resolve } from 'rsvp';
import { filterOptions, defaultMatcher } from 'ember-power-select/utils/group-utils';
import { setComponentTemplate } from '@ember/component';
import layout from '../templates/components/power-select-with-create';

class PowerSelectWithCreate extends Component {
  matcher = defaultMatcher;
  suggestedOptionComponent = 'power-select-with-create/suggested-option';
  powerSelectComponentName = 'power-select';
  searchEnabled = true;

  constructor(owner, args) {
    super(owner, args);

    assert('<PowerSelectWithCreate> requires an `onCreate` function', this.args.onCreate && typeof this.args.onCreate === 'function');
  }

  get optionsArray() {
    let { options } = this.args;
    if (!options) { return A(); }
    if (options.then) {
      return options.then(value => A(value).toArray());
    } else {
      return A(options).toArray();
    }
  }

  shouldShowCreateOption(term, options) {
    return this.args.showCreateWhen ? this.args.showCreateWhen(term, options) : true;
  }

  addCreateOption(term, results){
    if (this.shouldShowCreateOption(term, results)) {
      if(this.args.showCreatePosition === 'bottom') {
        results.push(this.buildSuggestionForTerm(term));
      }
      else {
        results.unshift(this.buildSuggestionForTerm(term));
      }
    }
  }

  @action
  searchAndSuggest(term, select) {
    return RSVP.resolve(this.optionsArray).then(newOptions => {
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

      newOptions = this.filter(A(newOptions), term);
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

export default setComponentTemplate(layout, PowerSelectWithCreate);