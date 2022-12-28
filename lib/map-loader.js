import { tileTypeCodes, tileCodeCharacterMap } from '../map-maker/store/tile-type-codes.js';

// console.log('savedMap1', savedMap1)
import { TileModel } from '../svg-maze/store/tile.model.js';

// export class MapLoader {
//   constructor() {
//     this.root;
//   };
//   get prop() { return this._prop };
//   set prop(newValue) { this._prop = newValue };
// }



/*
  MAP LOADER
  
  - Loads Maps in Ham Map Format (HMF)
  
  - Builds empty Map according to Map.dims
  
  - Sort map.tiles - Parse address, sort by row, then column
  
  - Instantiate new Tiles from map.tiles
  
  - Add Tile to Map Collection (Map)
  
*/

const MAP_SYMBOLS = new Map([
  ['*', { symbol: '*', tileTypeId: 7, tileType: 'empty', direction: null, hasCharacter: false, isPassable: false, }],
  ['#', { symbol: '#', tileTypeId: 0, tileType: 'barrier', direction: null, hasCharacter: false, isPassable: false, }],
  ['<', { symbol: '<', tileTypeId: 1, tileType: 'character', direction: 'left', hasCharacter: true, isPassable: false, }],
  ['>', { symbol: '>', tileTypeId: 1, tileType: 'character', direction: 'right', hasCharacter: true, isPassable: false, }],
  ['^', { symbol: '^', tileTypeId: 1, tileType: 'character', direction: 'up', hasCharacter: true, isPassable: false, }],
  ['v', { symbol: 'v', tileTypeId: 1, tileType: 'character', direction: 'down', hasCharacter: true, isPassable: false, }],
  [' ', { symbol: ' ', tileTypeId: 2, tileType: 'ground', direction: null, hasCharacter: false, isPassable: true, }],
  ['$', { symbol: '$', tileTypeId: 3, tileType: 'start', direction: null, hasCharacter: false, isPassable: true, isExit: false, isStart: true }],
  ['x', { symbol: 'x', tileTypeId: 4, tileType: 'exit', direction: null, hasCharacter: false, isPassable: true, isExit: true }],
  ['.', { symbol: '.', tileTypeId: 5, tileType: 'path', direction: null, hasCharacter: false, isPassable: true, isExit: false }],
  ['@', { symbol: '@', tileTypeId: 6, tileType: 'target', direction: null, hasCharacter: false, isPassable: true, isExit: true }],
]);

export const TILE_CONFIGS = new Map([
  ['*', { symbol: '*', tileTypeId: 7, tileType: 'empty', direction: null, hasCharacter: false, isPassable: false, }],
  ['#', { symbol: '#', tileTypeId: 0, tileType: 'barrier', direction: null, hasCharacter: false, isPassable: false, }],
  ['<', { symbol: '<', tileTypeId: 1, tileType: 'character', direction: 'left', hasCharacter: true, isPassable: false, }],
  ['>', { symbol: '>', tileTypeId: 1, tileType: 'character', direction: 'right', hasCharacter: true, isPassable: false, }],
  ['^', { symbol: '^', tileTypeId: 1, tileType: 'character', direction: 'up', hasCharacter: true, isPassable: false, }],
  ['v', { symbol: 'v', tileTypeId: 1, tileType: 'character', direction: 'down', hasCharacter: true, isPassable: false, }],
  [' ', { symbol: ' ', tileTypeId: 2, tileType: 'ground', direction: null, hasCharacter: false, isPassable: true, }],
  ['$', { symbol: '$', tileTypeId: 3, tileType: 'start', direction: null, hasCharacter: false, isPassable: true, isExit: false, isStart: true }],
  ['x', { symbol: 'x', tileTypeId: 4, tileType: 'exit', direction: null, hasCharacter: false, isPassable: true, isExit: true }],
  ['.', { symbol: '.', tileTypeId: 5, tileType: 'path', direction: null, hasCharacter: false, isPassable: true, isExit: false }],
  ['@', { symbol: '@', tileTypeId: 6, tileType: 'target', direction: null, hasCharacter: false, isPassable: true, isExit: true }],
]);

const tileTypeLookUp = new Map([
    [-1, 'empty'],
    [0, 'barrier'],
    [1, 'character'],
    [2, 'ground'],
    [3, 'start'],
    [4, 'exit'],
    [5, 'path'],
    [6, 'target'],
])

export class MapLoader {
  #map = new Map();
  #listeners = new Set();
  #tiles;
  #dims;
  #isLoading = false;

  constructor() {
    setTimeout(() => {
      // console.log('tilesLoader Condtructor', this);
    }, 500)

  }

  get tiles() { return this.#tiles }

  set tiles(v) {
    this.#tiles = v
    if (this.#isLoading) {}
  }

  get map() { return this.#map }

  get dims() { return this.#dims }

  set dims(v) {
    if (this.#isLoading) {
      this.#dims = v
    }
  }

  codeToChar(code = 0) {
    return tileCodeCharacterMap.get(code)
  }

  asTextRows() {
    return new Array(this.dims.rows)
  }

  listen(listener) {
    this.#listeners.add(listener)
  }

  emit(data) {
    this.#listeners.forEach(l => l(data))
  }

  loadMap({ key, mapName, map }) {
    this.#isLoading = true;

    this.meta = { key, mapName };

    this.dims = map.dims;

    // this.createMapModel(this.dims, null)
    // console.log('tileTypeLookUp.get(type) ', tileTypeLookUp.get(map.tiles[0].type))
    map.tiles.forEach(({ address, type }, i) => {
      this.updateTile(address, { tileType: tileTypeLookUp.get(type) })
    });

    Object.assign(this, map);

    this.#isLoading = false;

    this.emit(this.map)
  }

  createTile(row, column, tileType) {
    const tile = TileModel.create({ address: [row, column].toString(), tileType })
    return tile;
  }

  updateTile(address, updates = {}) {
    this.#map.set(address, { ...this.#map.get(address), ...updates })

    return this.#map.get(address);
  }

  insertTile(row, column, tileType) {
    const tile = this.createTile(row, column, tileType);
    return this.#map.set(tile.address, tile).get(tile.address);
  }


  createMapModel(dims, savedTiles) {
    const map = [];
    this.tiles.clear();

    this.setGridSize(dims);

    for (var row = 0; row < dims.height; row++) {
      for (var col = 0; col < dims.width; col++) {
        const st = savedTiles ? savedTiles.find(t => t.address == [row, col].toString()) : null;

        if (st) {
          // console.log('tileTypeCodes.get(st.type)', tileTypeCodes.get(st.type))
          this.insertTile(row, col, tileTypeCodes.get(st.type));
        }

        else {
          this.insertTile(row, col, 'empty');
        }
      }
    }
  }

  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}

export const mapLoader = new MapLoader();


// console.warn('mapLoader.map', [...mapLoader.map])
