import { Model, MapLocationModel } from './index.js';
import { getModelIdCreator } from '../create-model-id.js';

const createTileId = getModelIdCreator('t')

export const TileSchema = {
  symbol: String,
  tileTypeId: Number,
  tileType: String,
  direction: String,
  hasCharacter: Boolean,
  isPassable: Boolean,
  isExit: Boolean,
  isStart: Boolean,
  isPathNode: Boolean,
  isTarget: Boolean,
};

const CREATE_TILE_KEY = 'tile123';

export class TileModel extends Model {
  #address;
  #symbol = null;
  #tileTypeId = null;
  #tileType = null;
  
  #location = {
    column: null,
    row: null,
  };

  #hasCharacter = false;
  #isPassable = false;
  #isTarget = false;
  #isExit = false;
  #isStart = false;
  #isPathNode = false;

  #direction = null;

  constructor(INSTANTIATION_KEY, options) {
    super(INSTANTIATION_KEY, 'tile');
  }

  static create(options = null) {
    options = options ? options : {};

    const c = Object.assign(new TileModel(CREATE_TILE_KEY), options);

    return c;
  }

  static wrapValue(key, value) {
    return {
      [key]: value
    }
  }

  get symbol() { return this.#symbol }

  set symbol(v) { this.#symbol = v }

  get tileTypeId() { return this.#tileTypeId }

  set tileTypeId(v) { this.#tileTypeId = v }

  get tileType() { return this.#tileType }

  set tileType(v) { this.#tileType = v }

  get hasCharacter() { return this.#hasCharacter }

  set hasCharacter(v) { this.#hasCharacter = v }

  get isTarget() { return this.#isTarget || false }

  set isTarget(v) { this.#isTarget = v }

  get isPassable() { return this.#isPassable }

  set isPassable(v) { this.#isPassable = v }

  get isExit() { return this.#isExit }

  set isExit(v) { this.#isExit = v }

  get isStart() { return this.#isStart }

  set isStart(v) { this.#isStart = v }

  get isPathNode() { return this.#isPathNode }

  set isPathNode(v) { this.#isPathNode = v }

  get address() {
    return this.column && this.row ? [this.column, this.row].toString() : null
  }

  get column() {
    return this.#location.column
  }

  get row() {
    return this.#location.row
  }

  setLocation({ row, column }) {
    if ([row, column].includes(undefined || null || NaN)) return;
    this.#location = {
      row,
      column
    }
    // this.#location = MapLocationModel.create({ row, column })

    /* EMIT EVENT/DATA HERE? */
  }
}
