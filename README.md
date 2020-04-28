# Ember-power-select-with-create

Simple variation of ember-power-select that allows you to create a new entry based on the search text.

### Installation

```sh
ember install ember-power-select-with-create
```

### Compatibility

* Ember Source v3.13+
* Ember Power Select v4.0+

Please also refer to [Ember Power Select documentation](https://github.com/cibernox/ember-power-select#ember-power-select) for it's compatibility notes.

### Usage

```hbs
<PowerSelectWithCreate
  @options={{countries}}
  @selected={{selectedCountry}}
  @onChange={{action (mut selectedCountry)}}
  @onCreate={{action "createCountry"}}
  as |country|
>
  {{country.name}}
</PowerSelectWithCreate>
```

If you want to be able to select multiple options, use the `<PowerSelectMultipleWithCreate>` component instead. It has the same API as the normal `<PowerSelectWithCreate>`.

For more options please refer to the [Ember Power Select docs](http://www.ember-power-select.com/docs).

#### Control if create option should be shown

You can provide a callback `showCreateWhen`, which will be called whenever the user types into the search field.
If you return `true`, the create option will be shown. If you return `false`, it won't be shown.

```hbs
<PowerSelectWithCreate
  @options={{countries}}
  @searchField="name"
  @selected={{selectedCountry}}
  @onCreate={{action "createCountry"}}
  @showCreateWhen={{action "hideCreateOptionOnSameName"}}
  as |country|
>
  {{country.name}}
</PowerSelectWithCreate>
```

```js
import Component from '@ember/component';
import { action } from '@ember/object';

export default class MyComponent extends Component {
  @action
  hideCreateOptionOnSameName(term) {
    let existingOption = this.countries.find(({ name }) => name === term);
    return !existingOption;
  }
}
```

#### Control create option position

You can provide `showCreatePosition` property to control the position(bottom|top) of create option. It should be either `"top"` or `"bottom"`. It defaults to `"top"`.

```hbs
<PowerSelectWithCreate
  @options={{countries}}
  @searchField="name"
  @selected={{selectedCountry}}
  @onCreate={{action "createCountry"}}
  @showCreatePosition="bottom"
  @showCreateWhen={{action "hideCreateOptionOnSameName"}}
  as |country|
>
  {{country.name}}
</PowerSelectWithCreate>
```

#### Control the create option's label - Default `Add "{{option}}"...`

You can provide the `buildSuggestion` action to control the label of the create option. Default - `Add "{{option}}"...`

```hbs
<PowerSelectWithCreate
  @options={{countries}}
  @searchField="name"
  @selected={{selectedCountry}}
  @onCreate={{action "createCountry"}}
  @buildSuggestion={{action "customSuggestion"}}
>
  {{country.name}}
</PowerSelectWithCreate>
```

```js
import Component from '@ember/component';
import { action } from '@ember/object';

export default class MyComponent extends Component {
  @action
  customSuggestion(term) {
    return `Create ${term}`;
  }
}
```

#### Pass the creation option to a component for more control

Beyond building the suggestion label, you can pass the `suggestedOptionComponent` property the name of your component.

This component will receive the suggestedOption itself as `option` and the current `term` as `term`.

```hbs
<PowerSelectWithCreate
  @options={{countries}}
  @searchField="name"
  @selected={{selectedCountry}}
  @onCreate={{action "createCountry"}}
  @suggestedOptionComponent="suggested-option"
>
  {{country.name}}
</PowerSelectWithCreate>
```

```hbs
<!-- <SuggestedOption @option={{option}} @term={{term}} /> -->
<span class="is-suggested">
  Add "{{term}}"...
</span>
<!-- </SuggestedOption> -->
```

### Demo

[https://ember-power-select-with-create.pagefrontapp.com/](https://ember-power-select-with-create.pagefrontapp.com/)
