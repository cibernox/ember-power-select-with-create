import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import layout from '../../templates/components/power-select-with-create/suggested-option';

class PowerSelectWithCreateSuggestedOption extends Component {}

export default setComponentTemplate(layout, PowerSelectWithCreateSuggestedOption);