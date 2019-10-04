import PowerSelectWithCreate from './power-select-with-create';
import layout from '../templates/components/power-select-with-create';

export default PowerSelectWithCreate.extend({
  layout,
  powerSelectComponentName: 'power-select-multiple',

  selectOrCreate(selection, select) {
    let suggestion = selection.filter((option) => {
      return option.__isSuggestion__;
    })[0];

    if (suggestion) {
      this.get('onCreate')(suggestion.__value__, select);
    } else {
      this.get('onChange')(selection, select);
    }
  },
});
