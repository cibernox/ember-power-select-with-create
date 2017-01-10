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
    onchange=(action (mut selectedCountry))
    oncreate=(action "createCountry") as |country term|
}}
  {{country.name}}
{{/power-select-with-create}}
```

For more options please refer to the [ember-power-select docs](http://www.ember-power-select.com/docs)

#### Control if create option should be shown

You can provide a callback `showCreateWhen`, which will be called whenever the user types into the search field.
If you return `true`, the create option will be shown. If you return `false`, it won't be shown.

```hbs
{{#power-select-with-create
    options=countries
    searchField="name"
    selected=selectedCountry
    oncreate=(action "createCountry")
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
    oncreate=(action "createCountry")
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
    oncreate=(action "createCountry")
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

#### Yield create option

You can provide `yieldCreateOption` property to control whether or not the create option will be yielded like any other option. Default - `false`.

```hbs
{{#power-select-with-create
    options=countries
    searchField="name"
    selected=selectedCountry
    oncreate=(action "createCountry")
    yieldCreateOption=true as |country|
}}
  {{#if country.__isSuggestion__}}
    <span class="suggested-country">{{country.text}}</span>
  {{else}}
    <span class="country">{{country.name}}</span>
  {{/if}}
{{/power-select-with-create}}
```

*note, the `text` property on the create option is the result of the `buildSuggestion` action. Default: `Add "${term}"...`.*

#### Customize the isSuggestionField property

You can customize the property that determines whether an option `isSuggestion`. By default it is `__isSuggestion__`, however if this conflicts with your
data model for some reason you can specify it using the `isSuggestionField` setting.

```hbs
{{#power-select-with-create
    options=countries
    searchField="name"
    selected=selectedCountry
    oncreate=(action "createCountry")
    isSuggestionField="customSuggestedProperty"
    yieldCreateOption=true as |country|
}}
  {{#if country.customSuggestedProperty}}
    <span class="suggested-country">{{country.text}}</span>
  {{else}}
    <span class="country">{{country.name}}</span>
  {{/if}}
{{/power-select-with-create}}
```

* note, we show it with the `yieldCreateOption` for illustration purposes, you do not have to specify this property to customize the setting.

### Demo

[https://ember-power-select-with-create.pagefrontapp.com/](https://ember-power-select-with-create.pagefrontapp.com/)
