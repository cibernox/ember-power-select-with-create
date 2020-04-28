import PowerSelectWithCreate from './power-select-with-create';
import { action } from '@ember/object';

export default class PowerSelectMultipleWithCreate extends PowerSelectWithCreate {
  powerSelectComponentName = 'power-select-multiple';

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
