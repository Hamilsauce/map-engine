import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { rxjs, template, utils } = ham;
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class ControlBarView {
  #buttons;
  #self;

  constructor() {
    this.buttonEventSubject$ = new BehaviorSubject(null)

    this.buttonEvents$ = fromEvent(this.self, 'click')
      .pipe(
        map(({ target }) => target.closest('.move-button').dataset.direction),
      );

    this.buttonEvents$.subscribe(this.buttonEventSubject$);

    this.buttonEventStream$ = this.buttonEventSubject$.asObservable()
  }

  get self() {
    if (this.#self) return this.#self;

    this.#self = document.querySelector('#controls');

    return this.#self;
  }

  get buttons() {
    if (this.#buttons) return this.#buttons;

    this.#buttons = document.querySelector('#controls');

    return this.#buttons;
  }
}