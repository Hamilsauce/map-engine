import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { Collection } from './lib/collection.js';

const { template, utils } = ham;

const INSTANCE_TYPE_KEYS = new Map([
  ['tile', 'tile123'],  
])

// const _INSTANTIATION_KEY = '123';

export class AmazeoObject extends EventEmitter {
  // static #INSTANTIATION_KEY = '123';
  name;
  #type;
  #self;

  constructor({ INSTANTIATION_KEY, type }) {
    if (!INSTANTIATION_KEY || !INSTANCE_TYPE_KEYS.has(type) || INSTANTIATION_KEY !== INSTANCE_TYPE_KEYS.get(type)) throw new Error(`Illegal Constructor call for View Type [ ${ (type || '').toUpperCase() } ]. Use View.create`);

    super();

    this.#type = type;

    this.#self = View.getTemplate(type);
  }

  static getTemplate(name = '') {
    return template(name);
  };

  static get INSTANTIATION_KEY() { return INSTANCE_TYPE_KEYS.get(this.#type) }


  create(type = '') {}

  get html() { return this.#self }

  get type() { return this.#type }

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
