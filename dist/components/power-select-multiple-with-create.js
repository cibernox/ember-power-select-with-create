import PowerSelectWithCreateComponent from './power-select-with-create.js';
import { action } from '@ember/object';
import { ensureSafeComponent } from '@embroider/util';
import PowerSelectMultipleComponent from 'ember-power-select/components/power-select-multiple';
import { n } from 'decorator-transforms/runtime';

class PowerSelectMultipleWithCreate extends PowerSelectWithCreateComponent {
  get powerSelectComponent() {
    return ensureSafeComponent(this.args.powerSelectComponent || PowerSelectMultipleComponent, this);
  }
  selectOrCreate(selection, select) {
    let suggestion = selection.filter(option => {
      return option.__isSuggestion__;
    })[0];
    if (suggestion) {
      this.args.onCreate(suggestion.__value__, select);
    } else {
      this.args.onChange(selection, select);
    }
  }
  static {
    n(this.prototype, "selectOrCreate", [action]);
  }
}

export { PowerSelectMultipleWithCreate as default };
//# sourceMappingURL=power-select-multiple-with-create.js.map
