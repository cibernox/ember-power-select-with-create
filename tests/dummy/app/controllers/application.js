import { later } from '@ember/runloop';
import { Promise } from 'rsvp';
import Controller from '@ember/controller';

const countries = [
  { name: 'United States',  code: 'US', population: 321853000 },
  { name: 'Spain',          code: 'ES', population: 46439864 },
  { name: 'Portugal',       code: 'PT', population: 10374822 },
  { name: 'Russia',         code: 'RU', population: 146588880 },
  { name: 'Latvia',         code: 'LV', population: 1978300 },
  { name: 'Brazil',         code: 'BR', population: 204921000 },
  { name: 'United Kingdom', code: 'GB', population: 64596752 },
];

export default Controller.extend({
  countries,
  slowPromise: null,

  init() {
    this._super(...arguments);
    this.set('slowPromise', this.createSlowPromise());
    this.set('selectedCountries', []);
  },

  // Actions
  actions: {
    createCountry(countryName) {
      let newCountry = { name: countryName, code: 'XX', population: 'unknown' };
      this.get('countries').pushObject(newCountry);
      this.set('selectedCountry', newCountry);
      this.get('selectedCountries').push(newCountry);
    },
    searchCountries(term) {
      return new Promise((resolve, reject) => {
        this.createSlowPromise(2000).then((countries) => {
          resolve(countries.filter((country) => {
            return country.name.toLowerCase().match(term.toLowerCase());
          }));
        }, reject);
      });
    },
    hideCreateOptionOnSameName(term) {
      let existingOption = this.get('countries').findBy('name', term);
      return !existingOption;
    },
  },

  // Methods
  capitalizeSuggestion(term) {
    return `Hey! Perhaps you want to create ${term.toUpperCase()}??`;
  },

  createSlowPromise(time = 5000) {
    return new Promise(function(resolve) {
      later(() => resolve(countries), time);
    });
  },
});
