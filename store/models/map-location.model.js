import { Model } from './model.js';
const CREATE_LOCATION_KEY = 'location123';

export class MapLocationModel extends Model {
  #column = null;
  #row = null;
  #value = null;
  #queryFn = null;

  constructor(INSTANTIATION_KEY, column, row, queryFn) {
    super(INSTANTIATION_KEY, 'location');
    
    this.#column = column || this.#column;
    
    this.#row = row || this.#row;
    
    this.#queryFn = queryFn || this.#queryFn;
  }

  static create(column, row, queryFn) {
    let options = { column, row }
    const c = Object.assign(new MapLocationModel(CREATE_LOCATION_KEY, column, row, queryFn));

    return c;
  }

  setValue(queryFn) {
    this.#queryFn = queryFn;
  }

  get isEmpty() {
    return !this.value;
  }

  get column() { return this.#column };


  get row() { return this.#row };

  get value() { return this.#queryFn() };

  get address() { return this.#column && this.#row ? [this.#column, this.#row].toString() : null }

}
