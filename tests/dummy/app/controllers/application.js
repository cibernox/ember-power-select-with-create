import Ember from 'ember';

const countries = [
  { name: 'United States',  code: 'US', population: 321853000 },
  { name: 'Spain',          code: 'ES', population: 46439864 },
  { name: 'Portugal',       code: 'PT', population: 10374822 },
  { name: 'Russia',         code: 'RU', population: 146588880 },
  { name: 'Latvia',         code: 'LV', population: 1978300 },
  { name: 'Brazil',         code: 'BR', population: 204921000 },
  { name: 'United Kingdom', code: 'GB', population: 64596752 },
];

export default Ember.Controller.extend({
  countries,
  slowPromise: null,

  init() {
    this._super(...arguments);
    this.set('slowPromise', this.createSlowPromise());
  },

  // Actions
  actions: {
    createCountry(countryName) {
      let newCountry = { name: countryName, code: 'XX', population: 'unknown' };
      this.get('countries').pushObject(newCountry);
      this.set('selectedCountry', newCountry);
    },
    searchCountries(term) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.createSlowPromise(2000).then((countries) => {
          resolve(countries.filter((country) => {
            return country.name.toLowerCase().match(term.toLowerCase());
          }));
        }, reject);
      });
    },
  },

  // Methods
  capitalizeSuggestion(term) {
    return `Hey! Perhaps you want to create ${term.toUpperCase()}??`;
  },

  createSlowPromise(time = 5000) {
    return new Ember.RSVP.Promise(function(resolve) {
      Ember.run.later(() => resolve(countries), time);
    });
  },
});
