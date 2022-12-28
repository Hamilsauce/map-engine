import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { rxjs, template, utils } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const StateOptions = { id: null, state: {}, selectors: {}, actions: {} }

export const defineState = (options) => {
  if (!options) return;
  
  options = Object.fromEntries(Object.entries(options).filter(([key, value]) => Object.keys(StateOptions).includes(key)))
  
  
}

export const defineStore = ('counter', {
  state: () => ({ count: 0, name: 'Eduardo' }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
  },

})