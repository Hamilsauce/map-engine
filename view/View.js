import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { Collection } from '../lib/collection.js';
import { AmazeoObject } from '../lib/AmazeoObject.js';
// const {  TileView } = './tile.view.js';
// const { GridView } = './grid.view.js';
// console.log('GridView', GridView)
const { template, utils } = ham;

// const Views = new Map([
//   ['grid', GridView],
//   ['tile', TileView],
// ])


const templates = new Map([
  ['app', document.querySelector(`#app-template`)],
  ['book', document.querySelector(`#book-template`)],
  ['sheet', document.querySelector(`#sheet-template`)],
  ['tile', document.querySelector(`#tile-template`)],
])

const _INSTANTIATION_KEY = '123';

export class View extends AmazeoObject {
  static #INSTANTIATION_KEY = 'tile123';
  name;
  #type;
  #self;

  constructor({ INSTANTIATION_KEY, type }) {
    if (!INSTANTIATION_KEY || INSTANTIATION_KEY != _INSTANTIATION_KEY) throw new Error(`Illegal Constructor call for View Type [ ${ (type || '').toUpperCase() } ]. Use View.create`);

    super()

    this.#type = type;

    this.#self = View.getTemplate(type);
  }

  static get INSTANTIATION_KEY() { return View.#INSTANTIATION_KEY }

  get html() { return this.#self }

  get type() { return this.#type }

  static getTemplate(name = '') {
    return template(name);
  };

  create(type = '') {}

  render() { return this.#self }

  addCollection(type = '', entries = []) {
    if (!type) throw new Error('Must give new collection a type');
    if (this[type]) throw new Error('Collection of type already exists on View - this.#type, type: ', this.#type, type);

    const collection = new Collection(type, entries);

    Object.defineProperty(this, type, {
      get() { return collection }
    })

    return collection;
  }
}
