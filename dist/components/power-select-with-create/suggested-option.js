import templateOnly from '@ember/component/template-only';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

var TEMPLATE = precompileTemplate("{{@option.text}}");

var SuggestedOptionComponent = setComponentTemplate(TEMPLATE, templateOnly());

export { SuggestedOptionComponent as default };
//# sourceMappingURL=suggested-option.js.map
