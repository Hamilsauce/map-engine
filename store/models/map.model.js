import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { MAP_TILE_SYMBOLS, DIRECTIONS, CHARACTER_SYMBOLS } from '../../lib/Constants.js';
import { TileFactory } from '../tile-factory.js';
import { MapLocationModel, Model } from './index.js';
const { TwoWayMap, utils } = ham;

const CREATE_MAP_KEY = 'map123';

const MAP_OPTIONS = {
  dims: {},
  tiles: [],
}

const DEFAULT_MAP_DIMS = {
  columns: 25,
  rows: 25,
}

export class MapModel extends Model {
  #name;
  #tiles = [];
  #rows = [];
  #columns = null;
  #characterTile = null;
  #exitTile = null;
  #directionMoving = null;
  #dimensions = {
    columns: null,
    rows: null,
  };
  #namedLocations = {
    startTile: { column: null, row: null }
  };

  constructor(key, { dims, tiles, name }, callback) {
    if (!dims || !(dims.rows && dims.columns)) throw new Error('Invalid dims psssed to MapModel. Value: ', dims);

    super(key, 'map');

    this.#name = !!name ? name : this.#name;

    this.dirs = DIRECTIONS;

    dims = dims.rows && dims.columns ? dims : DEFAULT_MAP_DIMS

    this.initialize(dims, callback);
  }

  static create(options = null, callback) {
    const m = Object.assign(new MapModel(CREATE_MAP_KEY, options, callback));
    return m;
  }

  get characterTile() {
    return this.findTileBy('hasCharacter', true)
  }

  set characterTile(target) {
    if (this.characterTile) {
      this.#characterTile.isPathNode = false;
      this.#characterTile.hasCharacter = false;
    }

    if (target) {
      this.#characterTile = target
      this.#characterTile.hasCharacter = true;
    }

    else { this.#characterTile = null }
  }

  get targetTile() {
    const targ = this.findTileBy('isTarget', true)
    return targ // ? targ : this.exitTile
  }

  get exitTile() { return this.findTileBy('isExit', true) }

  get columns() { return this.#columns ? this.#columns : this.#deriveColumns() }

  get tiles() { return this.#tiles ? this.#tiles : this.#deriveTiles() }

  get rows() { return this.#tiles ? this.#tiles : [] }

  get width() { return this.dims ? this.dims.width : this.tiles[0].length }

  get height() { return this.dims ? this.dims.height : this.tiles.length }

  get firstTile() { return this.tile(0, 0) }

  get columnCount() { return this.tiles[0].length - 0 }

  get rowCount() { return this.tiles.length - 0 }

  get lastTile() { return this.tile(this.height, this.width) }

  get occupiedTile() { return this.#characterTile }

  get tiles() { return this.#tiles };

  get pathNodes() { return this.findAllTilesBy('isPathNode', true) };

  #createEmptyMap(columns = 1, rows = 1, options) {
    rows = rows ? rows : 1;
    columns = columns ? columns : 1;

    this.#tiles = new Array(rows).fill(new Array(columns).fill(null));

    return this.#tiles.length === rows && this.#tiles[0].length === columns;
  }

  initialize({ columns, rows }, callback) {
    const tilesCreated = this.#createEmptyMap(columns, rows)

    this.emit('map:initialized');

    if (tilesCreated && callback) {
      callback(this.tiles)
    }
  }

  load(tileMatrix = []) {
    const newTiles = this.setTiles(tileMatrix);

    this.emit('map:loaded', this.#tiles)
    // console.log('this.print()', this.print())
  }


  setTargetTile(column, row) {
    const prev = this.targetTile;
    const targ = this.tile(+column, +row);

    if (prev && targ && prev === targ) {
      this.updateTile(prev, { isTarget: false, isPathNode: false });

      return targ;
    }
    // else if (prev && targ && prev === targ) {
    //   this.updateTile(prev, { isTarget: false, isPathNode: false });

    //   return targ;
    // }

    if (prev) {
      this.updateTile(prev, { isTarget: false, isPathNode: false });
    }
    this.updateTile(targ, { isTarget: true, isPathNode: true });

    let queue = this.getPathQueue(this.shortestPathDfs(this.characterCell, this.targetTile))

    return queue;
  }

  insertTile(tileSymbol, column, row) {
    if (!this.isInBounds(column, row)) return;

    const model = TileFactory.bySymbol(tileSymbol)
    model.setLocation({ column, row });

    this.#tiles[row][column] = model;

    return model;
  }

  isInBounds(c, r) {
    return (c >= 0 && c <= this.width) && (r >= 0 && r <= this.height)
  }

  hasTileAt(c, r) {
    return this.isInBounds(c, r) && this.getLocation(c, r)
  }

  getLocation(c, r, queryFn = this.tileQuery) {
    queryFn = queryFn.bind(this);

    return this.isInBounds(c, r) ?
      MapLocationModel.create(c, r, queryFn(c, r)) :
      undefined;
  }

  findTileBy(key, value) {
    return this.#deriveTiles().find(t => t[key] && t[key] === value)
  }

  findAllTilesBy(key, value) {
    return this.#deriveTiles().filter(t => t[key] && t[key] === value)
  }

  setTiles(newTiles = []) {
    if (!(newTiles && newTiles.length)) return;

    this.dims = { width: newTiles[0].length, height: newTiles.length }

    this.#tiles = newTiles
      .map((row, r) => row.split('').map(
        (symb, column) => {
          const tile = this.insertTile(symb, column, r);

          if (tile.hasCharacter) this.#characterTile = this.tile(column, r);

          return tile;
        })).filter(_ => _);

    window['mapTiles'] = this.#tiles

    return this.#tiles;
  }

  updateTile(tile, updates) {
    if (tile && updates) Object.assign(tile, updates);
    this.emit('tiles:updated', [tile])

    return { ...tile } || null;
  }

  isCharacterInBounds() {
    return (this.characterTile.row > 0 && this.#characterTile.row < this.height) &&
      (this.characterTile.column > 0 && this.#characterTile.column < this.width);
  }

  tileQuery(column, row) {
    if ([+row, +column].includes(NaN) || !this.isInBounds(column, row)) return null;

    return () => this.#tiles[row][column] || null;
  }

  tile(column, row) {
    if ([row, column].includes(NaN)) return;

    return this.isInBounds(column, row) ? this.#tiles[row][column] : null;
  }

  getDirName(tile, offsetCoords = [0, 0]) {
    return Object.entries(DIRECTIONS)
      .filter(([key, coords]) => offsetCoords[0] === coords[0] && offsetCoords[1] === coords[1])
      .map(([key, coords]) => key)
  }

  moveCharacter(dirNameOrRef) {
    let changedTiles = this.characterTile ? [this.characterTile] : []

    if (typeof dirNameOrRef === 'string') {
      let dirName = dirNameOrRef;

      this.directionMoving = dirName;

      const neighbors = this.findNeighbors(this.characterTile);
      if (neighbors[dirName]) this.characterTile = neighbors[dirName];
    }

    else {
      this.characterTile = dirNameOrRef;
    }

    changedTiles.push(this.characterTile)

    this.emit('tiles:updated', changedTiles)

    return this.characterTile;
  }

  findNeighbor(tile, dirName) {
    if (!tile || !dirName) return;

    const dir = this.dirs[dirName];
    const { column, row } = tile || {};

    return this.tile(column + dir.column, row + dir.row, );
  }

  findNeighbors(tile) {
    return tile ? Object.entries(this.dirs)
      .reduce((acc, [name, coords], i) => {
        const neighbor = this.findNeighbor(tile, name);

        return neighbor && neighbor.isPassable ? { ...acc, [name]: neighbor } : acc;
      }, {}) : null;
  }

  row(index) {
    return this.#tiles[index];
  }

  column(colIndex) {
    return this.#tiles.map((row, i) => this.tile(i, colIndex));
  }

  // print(showPath = false) {
  //   if (showPath) {
  //     this.shortestPath = this.shortestPathDfs();
  //   } else this.shortestPath = null

  //   const output = this.#tiles.reduce((string, row, i) => `
  //     ${string}
  //     ${
  //       row.map(_=> {
  //         console.log('this.shortestPath', this.shortestPath)
  //           if (this.shortestPath && this.shortestPath.previous) {
  //           return '_'
  //         }
          
  //           return _.hasCharacter === true ? CHARACTER_SYMBOLS.get(this.directionMoving || 'left') : _.symbol;
  //       }).join('')
  //     }`, '').trim();

  //   return output;
  // }

  getUnvisitedNeighbors(tile) {
    return tile ? (Object.entries(this.findNeighbors(tile)) || []).filter(([k, v]) => !v.previous) : null;
  }

  getPath() {
    if (this.pathNodes) {
      this.pathNodes.forEach((tile) => { tile.isPathNode = false })
    }
    let queue = this.getPathQueue(this.shortestPathDfs(this.characterCell, this.targetTile || this.exitTile))

    return queue
  }

  getPathQueue(endPathNode) {
    const queue = [];
    let curr = endPathNode;

    while (curr) {
      queue.unshift(curr)
      curr = curr.previous
    }
    return queue;
  }

  shortestPathDfs(tile = this.characterTile, stopNode = this.targetTile || this.exitTile) {

    tile.isPathNode = true;
    // this.updateTile(tile, { isPathNode: true });

    if (tile === stopNode) return tile;

    let unvisitedNeighbors = this.getUnvisitedNeighbors(tile);

    if (unvisitedNeighbors.length == 0 && tile.previous) {
      tile.isPathNode = false;
      tile = tile.previous;
      // this.updateTile(tile, { isPathNode: false });

      while (tile && unvisitedNeighbors.length === 0) {
        tile.isPathNode = false;
        // this.updateTile(tile, { isPathNode: false });
        tile = tile.previous;

        unvisitedNeighbors = this.getUnvisitedNeighbors(tile);
      }

      return this.shortestPathDfs(tile);
    }

    else {
      this.cnt = (this.cnt || 0) + 1;

      for (var [direction, neighbor] of unvisitedNeighbors) {
        neighbor.isPathNode = true;
        neighbor.previous = tile;
        // this.updateTile(neighbor, { isPathNode: true, previous: tile });

        if (neighbor === stopNode) return neighbor;

        if (neighbor !== stopNode && unvisitedNeighbors.length > 0) {
          return this.shortestPathDfs(neighbor);
        }

        else { return tile }
      }
    }

    return tile; /* If no path, return null */
  }

  findExit(search = 'dfs', startTile = this.characterTile) {
    return search === 'dfs' ? this.shortestPathDfs(this.characterTile, this.exitTile) :
      this.shortestPathBfs(this.characterTile, this.exitTile)
  }

  #deriveTiles() {
    return this.#tiles.reduce((tiles, row, i) => [...tiles, ...row], []);
  }

  #deriveColumns() {
    let cols = [];

    for (let col = 0; col <= this.width; col++) {
      cols = [...cols, this.column(col)];
    }

    return cols;
  }
}
