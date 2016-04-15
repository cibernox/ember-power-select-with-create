# Ember-power-select-with-create

Simple variation of ember-power-select that allows you to create a new entry based on the search text.

### Installation

```
ember install ember-power-select-with-create
```

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

### Demo

[https://ember-power-select-with-create.pagefrontapp.com/](https://ember-power-select-with-create.pagefrontapp.com/)
