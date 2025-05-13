import { assert } from '@ember/debug';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get } from '@ember/object';
import RSVP, { resolve } from 'rsvp';
import PowerSelectComponent from 'ember-power-select/components/power-select';
import { defaultMatcher, filterOptions } from 'ember-power-select/utils/group-utils';
import { ensureSafeComponent } from '@embroider/util';
import SuggestedOptionComponent from './power-select-with-create/suggested-option.js';
import { precompileTemplate } from '@ember/template-compilation';
import { g, i, n } from 'decorator-transforms/runtime';
import { setComponentTemplate } from '@ember/component';

var TEMPLATE = precompileTemplate("<this.powerSelectComponent\n  @afterOptionsComponent={{@afterOptionsComponent}}\n  @allowClear={{@allowClear}}\n  @ariaDescribedBy={{@ariaDescribedBy}}\n  @ariaInvalid={{@ariaInvalid}}\n  @ariaLabel={{@ariaLabel}}\n  @ariaLabelledBy={{@ariaLabelledBy}}\n  @beforeOptionsComponent={{this.beforeOptionsComponent}}\n  @buildSelection={{@buildSelection}}\n  @calculatePosition={{@calculatePosition}}\n  @class={{@class}}\n  @closeOnSelect={{@closeOnSelect}}\n  @defaultHighlighted={{@defaultHighlighted}}\n  @destination={{@destination}}\n  @dir={{@dir}}\n  @disabled={{@disabled}}\n  @dropdownClass={{@dropdownClass}}\n  @eventType={{@eventType}}\n  @extra={{@extra}}\n  @groupComponent={{@groupComponent}}\n  @highlightOnHover={{@highlightOnHover}}\n  @horizontalPosition={{@horizontalPosition}}\n  @initiallyOpened={{@initiallyOpened}}\n  @loadingMessage={{@loadingMessage}}\n  @matchTriggerWidth={{@matchTriggerWidth}}\n  @matcher={{this.matcher}}\n  @noMatchesMessage={{@noMatchesMessage}}\n  @onBlur={{@onBlur}}\n  @onChange={{this.selectOrCreate}}\n  @onClose={{@onClose}}\n  @onFocus={{@onFocus}}\n  @onInput={{@onInput}}\n  @onKeydown={{@onKeydown}}\n  @onOpen={{@onOpen}}\n  @options={{@options}}\n  @optionsComponent={{@optionsComponent}}\n  @placeholder={{@placeholder}}\n  @placeholderComponent={{@placeholderComponent}}\n  @preventScroll={{@preventScroll}}\n  @registerAPI={{@registerAPI}}\n  @renderInPlace={{@renderInPlace}}\n  @scrollTo={{@scrollTo}}\n  @search={{this.searchAndSuggest}}\n  @searchEnabled={{this.searchEnabled}}\n  @searchField={{@searchField}}\n  @searchMessage={{@searchMessage}}\n  @searchMessageComponent={{@searchMessageComponent}}\n  @searchPlaceholder={{@searchPlaceholder}}\n  @selected={{@selected}}\n  @selectedItemComponent={{@selectedItemComponent}}\n  @tabindex={{@tabindex}}\n  @triggerClass={{@triggerClass}}\n  @triggerComponent={{@triggerComponent}}\n  @triggerId={{@triggerId}}\n  @triggerRole={{@triggerRole}}\n  @typeAheadMatcher={{@typeAheadMatcher}}\n  @verticalPosition={{@verticalPosition}}\n  ...attributes\n  as |option term|\n>\n  {{#if option.__isSuggestion__}}\n    <this.suggestedOptionComponent @option={{option}} @term={{term}} />\n  {{else}}\n    {{yield option term}}\n  {{/if}}\n</this.powerSelectComponent>");

class PowerSelectWithCreateComponent extends Component {
  matcher = defaultMatcher;
  static {
    g(this.prototype, "searchEnabled", [tracked], function () {
      return true;
    });
  }
  #searchEnabled = (i(this, "searchEnabled"), void 0);
  // Lifecycle hooks
  constructor() {
    super(...arguments);
    assert('<PowerSelectWithCreate> requires an `onCreate` function', this.args.onCreate && typeof this.args.onCreate === 'function');
  }
  get powerSelectComponent() {
    return ensureSafeComponent(this.args.powerSelectComponent || PowerSelectComponent, this);
  }
  get suggestedOptionComponent() {
    return ensureSafeComponent(this.args.suggestedOptionComponent || SuggestedOptionComponent, this);
  }
  shouldShowCreateOption(term, options) {
    return this.args.showCreateWhen ? this.args.showCreateWhen(term, options) : true;
  }
  addCreateOption(term, results) {
    if (this.shouldShowCreateOption(term, results)) {
      if (this.args.showCreatePosition === 'bottom') {
        results.push(this.buildSuggestionForTerm(term));
      } else {
        results.unshift(this.buildSuggestionForTerm(term));
      }
    }
  }
  searchAndSuggest(term, select) {
    return RSVP.resolve(this.args.options).then(newOptions => {
      if (term.length === 0) {
        return newOptions;
      }
      let searchAction = this.args.search;
      if (searchAction) {
        return resolve(searchAction(term, select)).then(results => {
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
  static {
    n(this.prototype, "searchAndSuggest", [action]);
  }
  selectOrCreate(selection, select, e) {
    if (selection && selection.__isSuggestion__) {
      this.args.onCreate(selection.__value__, select, e);
    } else {
      this.args.onChange(selection, select, e);
    }
  }

  // Methods
  static {
    n(this.prototype, "selectOrCreate", [action]);
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
      text: this.buildSuggestionLabel(term)
    };
  }
  buildSuggestionLabel(term) {
    if (this.args.buildSuggestion) {
      return this.args.buildSuggestion(term);
    }
    return `Add "${term}"...`;
  }
}
setComponentTemplate(TEMPLATE, PowerSelectWithCreateComponent);

export { PowerSelectWithCreateComponent as default };
//# sourceMappingURL=power-select-with-create.js.map
