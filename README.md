# Ember-power-select-with-create

Simple variation of ember-power-select that allows you a new entry based on the search text

### Usage

```hbs
{{#power-select-with-create options=countries selected=selectedCountry onchange=(action (mut selectedCountry)) oncreate=(action "createCountry") as |country term|}}
  {{country.name}}
{{/power-select-with-create}}
```