import PowerSelectWithCreate from './power-select-with-create';
import { action } from '@ember/object';
import { ensureSafeComponent } from '@embroider/util';
import PowerSelectMultipleComponent from 'ember-power-select/components/power-select-multiple';

export default class PowerSelectMultipleWithCreate extends PowerSelectWithCreate {
  get powerSelectComponent() {
    return ensureSafeComponent(
      this.args.powerSelectComponent || PowerSelectMultipleComponent,
      this
    );
  }

  @action
  selectOrCreate(selection, select) {
    let suggestion = selection.filter((option) => {
      return option.__isSuggestion__;
    })[0];

    if (suggestion) {
      this.args.onCreate(suggestion.__value__, select);
    } else {
      this.args.onChange(selection, select);
    }
  }
}
