# Ember-power-select-with-create

Simple variation of ember-power-select that allows you a new entry based on the search text

### Installation

```
ember install ember-power-select-with-create
```

### Usage

```hbs
{{#power-select-with-create options=countries selected=selectedCountry onchange=(action (mut selectedCountry)) oncreate=(action "createCountry") as |country term|}}
  {{country.name}}
{{/power-select-with-create}}
```

### Demo

[https://ember-power-select-with-create.pagefrontapp.com/](https://ember-power-select-with-create.pagefrontapp.com/)
