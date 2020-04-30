import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { Promise } from 'rsvp';
import { later } from '@ember/runloop';
import { A } from '@ember/array';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @tracked selectedCountry = null;

  countries = A([
    { name: 'United States',  code: 'US', population: 321853000 },
    { name: 'Spain',          code: 'ES', population: 46439864 },
    { name: 'Portugal',       code: 'PT', population: 10374822 },
    { name: 'Russia',         code: 'RU', population: 146588880 },
    { name: 'Latvia',         code: 'LV', population: 1978300 },
    { name: 'Brazil',         code: 'BR', population: 204921000 },
    { name: 'United Kingdom', code: 'GB', population: 64596752 },
  ]);
  selectedCountries = A();
  slowPromise = null;

  constructor(owner, args) {
    super(owner, args);

    this.slowPromise = this.createSlowPromise()
  }

  @action
  createCountry(countryName) {
    let newCountry = { name: countryName, code: 'XX', population: 'unknown' };

    this.countries.pushObject(newCountry);
    this.selectedCountry = newCountry;
    this.selectedCountries.pushObject(newCountry);
  }
  
  @action
  searchCountries(term) {
    return new Promise((resolve, reject) => {
      this.createSlowPromise(2000).then((countries) => {
        resolve(countries.filter((country) => {
          return country.name.toLowerCase().match(term.toLowerCase());
        }));
      }, reject);
    });
  }

  @action
  hideCreateOptionOnSameName(term) {
    let existingOption = this.countries.findBy('name', term);
    return !existingOption;
  }

  capitalizeSuggestion(term) {
    return `Hey! Perhaps you want to create ${term.toUpperCase()}??`;
  }

  createSlowPromise(time = 5000) {
    return new Promise((resolve) => {
      later(() => resolve(this.countries), time);
    });
  }
}
