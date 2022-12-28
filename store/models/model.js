import { 
  EventEmitter, 
// StateEmitter
} from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { createModelId, getModelIdCreator } from '../create-model-id.js';

const prefixMap = new Map([
  ['map', 'm'],
  ['tile', 't'],
  ['range', 'r'],
  ['location', 'location123'],
]);

const ACTIONS = new Map([
  ['map:initialized', { propKey: 'tiles' }],
  ['tile', 'tile123'],
  ['range', 'range123'],
  ['location', 'location123'],
]);

const INSTANTIATION_KEYS = new Map([
  ['map', 'map123'],
  ['tile', 'tile123'],
  ['range', 'range123'],
  ['location', 'location123'],
]);

export class Model extends EventEmitter {
  #name = null;
  #schema = null;
  #modelId = null

  constructor(key, name) {
    if (!prefixMap.has(name)) throw new Error(`Invalid model type passed to Model Constructor. Type: ${name}`);
    if (INSTANTIATION_KEYS.get(name) != key) throw new Error(`ILLEGAL MODEL CONSTRUCTOR CALL, USE CREATE METHOD, Type: ${name}`, name);
    super();
  
    this.#name = name;
    this.#modelId = getModelIdCreator(prefixMap.get(name));
  }

  dispatchOn(actionType, listener) {
    if (!ACTIONS.get(actionType)) return;

    const key = ACTIONS.get(actionType).propKey
    listener(this[key]);
  }

  get name() { return this.#name }

  get modelId() { return this.#modelId }

  // get schema() { return this.#schema }

  create() {}

  update() {}
}
