# Ember-power-select-with-create

Simple variation of ember-power-select that allows you to create a new entry based on the search text.

### Installation

```
ember install ember-power-select-with-create
```

Versions 0.1.X worked with EPS < 1.0
Version 0.2.X requires EPS 1.0.0-beta.14 or greater.

### Usage

```hbs
{{#power-select-with-create
    options=countries
    selected=selectedCountry
    onChange=(action (mut selectedCountry))
    onCreate=(action "createCountry") as |country term|
}}
  {{country.name}}
{{/power-select-with-create}}
```

If you want to be able to select multiple options, use the `power-select-multiple-with-create` component instead. It has the same API as the normal `power-select-with-create`.

For more options please refer to the [ember-power-select docs](http://www.ember-power-select.com/docs)

#### Control if create option should be shown

You can provide a callback `showCreateWhen`, which will be called whenever the user types into the search field.
If you return `true`, the create option will be shown. If you return `false`, it won't be shown.

```hbs
{{#power-select-with-create
    options=countries
    searchField="name"
    selected=selectedCountry
    onCreate=(action "createCountry")
    showCreateWhen=(action "hideCreateOptionOnSameName") as |country|
}}
  {{country.name}}
{{/power-select-with-create}}
```

```js
actions: {
  hideCreateOptionOnSameName(term) {
    let existingOption = this.get('countries').findBy('name', term);
    return !existingOption;
  },
},
```


#### Control create option position - Default TOP

You can provide `showCreatePosition` property to control the position(bottom|top) of create option. Default - top

```hbs
{{#power-select-with-create
    options=countries
    searchField="name"
    selected=selectedCountry
    onCreate=(action "createCountry")
    showCreatePosition='bottom'
    showCreateWhen=(action "hideCreateOptionOnSameName") as |country|
}}
  {{country.name}}
{{/power-select-with-create}}
```

#### Control the create option's label - Default `Add "{{option}}"...`

You can provide the `buildSuggestion` action to control the label of the create option. Default - `Add "{{option}}"...`

```hbs
{{#power-select-with-create
    options=countries
    searchField="name"
    selected=selectedCountry
    onCreate=(action "createCountry")
    buildSuggestion=(action "customSuggestion")
}}
  {{country.name}}
{{/power-select-with-create}}
```

```js
actions: {
  customSuggestion(term) {
    return `Create ${term}`;
  },
},
```

#### Pass the creation option to a component for more control

Beyond building the suggestion label, you can pass the `suggestedOptionComponent` property the name of your component.

This component will receive the suggestedOption itself as `option` and the current `term` as `term`.

```hbs
{{#power-select-with-create
    options=countries
    searchField="name"
    selected=selectedCountry
    onCreate=(action "createCountry")
    suggestedOptionComponent="suggested-option"
}}
  {{country.name}}
{{/power-select-with-create}}
```

```hbs
<!-- {{suggested-option option=option term=term}} -->
<span class="is-suggested">
  Add "{{term}}"...
</span>
<!-- {{/suggested-option}} -->
```

### Demo
[https://ember-power-select-with-create.pagefrontapp.com/](https://ember-power-select-with-create.pagefrontapp.com/)
