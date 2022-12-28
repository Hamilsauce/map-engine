import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { TwoWayMap, utils } = ham;
// import { bfs, shortestPathBfs } from './shortest-path.js';
import { TileFactory } from './store/tile-factory.js';

import { MAP_TILE_SYMBOLS, DIRECTIONS, CHARACTER_SYMBOLS } from '../../lib/Constants.js';

// const MAP_TILE_SYMBOLS = new Map([
//   ['#', ((options = {}) => ({ ...{ symbol: '#', tileTypeId: 0, tileType: 'barrier', direction: null, isCharacter: false, isPassable: false, }, ...options })).bind(this)],
//   ['<', ((options = {}) => ({ ...{ symbol: '<', tileTypeId: 1, tileType: 'character', direction: 'left', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
//   ['>', ((options = {}) => ({ ...{ symbol: '>', tileTypeId: 1, tileType: 'character', direction: 'right', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
//   ['^', ((options = {}) => ({ ...{ symbol: '^', tileTypeId: 1, tileType: 'character', direction: 'up', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
//   ['v', ((options = {}) => ({ ...{ symbol: 'v', tileTypeId: 1, tileType: 'character', direction: 'down', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
//   [' ', ((options = {}) => ({ ...{ symbol: ' ', tileTypeId: 2, tileType: 'ground', direction: null, isCharacter: false, isPassable: true, }, ...options })).bind(this)],
//   ['x', ((options = {}) => ({ ...{ symbol: 'x', tileTypeId: 3, tileType: 'exit', direction: null, isCharacter: false, isPassable: true, isExit: true }, ...options })).bind(this)],
//   ['.', ((options = {}) => ({ ...{ symbol: '.', tileTypeId: 4, tileType: 'path', direction: null, isCharacter: false, isPassable: true, isExit: false }, ...options })).bind(this)],
// ]);



// const tileFactory = (symbol, options) => {
//   return MAP_TILE_SYMBOLS.get(symb)
//   //({ id, hasCharacter: false, position: { column, row: r } });

// };

export class TileModel {
  constructor() {
    this.root;
  }

  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}

const newBarrier = () => ({ symbol: '#', tileTypeId: 0, tileType: 'barrier', isCharacter: false, isPassable: false, })
const newCharacter = () => ({ symbol: '<', tileTypeId: 1, tileType: 'character', isCharacter: true, isPassable: false, })
const newGround = () => ({ symbol: ' ', tileTypeId: 2, tileType: 'ground', isCharacter: false, isPassable: true, })

// const DIRECTIONS = {
//   right: [1, 0],
//   down: [0, 1],
//   left: [-1, 0],
//   up: [0, -1],
// }

// const characterSymbols = new TwoWayMap([
//   ['<', 'left'],
//   ['>', 'right'],
//   ['^', 'up'],
//   ['v', 'down'],
// ]);


export class MapModel {
  #map;
  #tiles = null;
  #rows = [];
  #dimensions = {
    columns: null,
    rows: null,
  };
  #columns = null;
  #characterTile = null;
  #exitTile = null;
  #directionMoving = null;


  constructor({ dims, tiles }) {

    // this.setDims(dims)

    if (tiles) {
      this.#tiles = this.setMap(tiles);
    }

    this.targetTile;
    this.dirs = DIRECTIONS;
  }

  set characterTile(target) {
    if (this.#characterTile) {
      this.#characterTile.hasCharacter = false;
      this.#characterTile.isPathNode = false;
    }

    if (target) {
      this.#characterTile = target
      this.#characterTile.hasCharacter = true;
    }

    else { this.#characterTile = null }
  }

  get characterTile() { return this.#characterTile || null }

  get width() { return this.#column || null }

  get height() { return this.#dimensions.rows || null }

  get length() { return this.#dimensions.columns || null }

  get columns() { return this.#columns ? this.#columns : this.#deriveColumns() }

  get tiles() { return this.#tiles ? this.#tiles : this.#deriveTiles() }

  get rows() { return this.#tiles ? this.#tiles : [] }

  get firstTile() { return this.tile(0, 0) }

  get columnCount() { return this.tiles[0].length - 1 }

  get rowCount() { return this.tiles.length - 1 }

  get lastTile() { return this.tile(this.rowCount, this.columnCount) }

  get occupiedTile() { return this.#characterTile }

  get exitTile() {
    if (this.#exitTile) { return this.#exitTile }

    this.#exitTile = this.tiles.find((tile, i) => {
      return tile.isExit === true;
    });

    return this.#exitTile || null;
  }

  get tiles() { return this.#tiles };

  setDimensions(column, row) {
    const model = TileFactory.bySymbol(symb)
    model.setLocation({ column, row })
    // const tile = this.createGridTile(model)
    return model;
  }

  insertTile(tileSymbol, column, row) {
    const model = TileFactory.bySymbol(tileSymbol)
    model.setLocation({ column, row })

    return model;
  }

  // createMazeGrid(map = []) {
  //   // this.mazeEl = document.createElement('div');
  //   console.log('createMazeGrid map', map)

  //   return (typeof map === 'string' ? map.split('\n') : map)
  //     .map((row, r) => (typeof map[0] === 'string' ? row.split('') : row)
  //       .map((symb, column) => {
  //         const tile = this.insertTile(symb, column, r);
  //         console.log('tile', tile)
  //         return tile;
  //         // model.setLocation({ column, row: r })
  //         // const tile = this.createGridTile(model)

  //         // return this.insertTile();
  //       })
  //     ).filter(_ => _.length > 0);
  // };


  setMap(newMap = [], ) {
    // this.#columns = null;

    if (!(newMap && newMap.length)) return;

    this.#tiles = newMap.map((row, r) => row.split('').map((symb, column) => {
          const tile = this.insertTile(symb, column, r);
          // console.warn('tile in setMap', tile)

          // let id = 'c' + utils.uuid()

          if (CHARACTER_SYMBOLS.has(symb)) {
            this.#characterTile = tile; //MAP_TILE_SYMBOLS.get(' ')({ id, hasCharacter: true, position: { column, row: r } });

            return this.#characterTile;
          }
          // else if (symb.toLowerCase() === 'x') {
          //   this.#exitTile = MAP_TILE_SYMBOLS.get('x')({ id, isExit: true, position: { column, row: r } });

          //   return this.#exitTile;
          // }
          // return MAP_TILE_SYMBOLS.get(symb)({ id, hasCharacter: false, position: { column, row: r } });
          return tile;
        })).filter(_ => _);

    return this.#tiles;
  }

  updateTile(r, c, updates) {
    const tile = this.tile(r, c);

    if (tile && updates) {
      Object.assign(tile, updates);
    }

    return { ...tile } || null;
  }

  isOutOfBounds(row, column) {
    return (row < 0 || row > this.rowCount) || (column < 0 || column > this.columnCount);
  }


  isCharacterInBounds() {
    return (this.#characterTile.position.row > 0 && this.#characterTile.position.row < this.rowCount) &&
      (this.#characterTile.position.column > 0 && this.#characterTile.position.column < this.columnCount);
  }

  tile(row, column) {
    if ([+row, +column].includes(NaN)) return;

    if (this.isOutOfBounds(row, column)) {
      return null;
    } else {
      return this.#tiles[row][column] || null;
    }
  }

  row(index) {
    return this.#tiles[index];
  }

  moveCharacter(dirNameOrRef) {
    const prev = this.characterTile;

    if (typeof dirNameOrRef === 'string') {
      let dirName = dirNameOrRef;

      this.directionMoving = dirName;
      console.log('this.characterTile', this.characterTile)
      const neighbors = this.findNeighbors(this.characterTile);
      console.log('neighbors', neighbors)
      if (neighbors && neighbors[dirName]) this.characterTile = neighbors[dirName];
    }

    else this.characterTile = dirNameOrRef;

    return this.characterTile;
  }

  findNeighbor(tile = { position: {} }, dirName) {
    if (!tile || !dirName) return;

    const dir = this.dirs[dirName];
    const { column, row } = tile.position || {};

    return this.tile(
      row + dir[1],
      column + dir[0],
    );
  }

  findNeighbors(tile) {
    return tile ? Object.entries(this.dirs)
      .reduce((acc, [name, coords], i) => {
        const neighbor = this.findNeighbor(tile, name);

        return neighbor && neighbor.isPassable ? { ...acc, [name]: neighbor } : acc;
      }, {}) : null;
  }

  findExit(search = 'dfs', startTile = this.characterTile) {
    return search === 'dfs' ? this.shortestPathDfs(this.characterTile, this.exitTile) :
      this.shortestPathBfs(this.characterTile, this.exitTile)
  }

  column(colIndex) {
    return this.#tiles.map((row, i) => this.tile(i, colIndex));
  }

  print(showPath = false) {
    if (showPath) { this.shortestPath = this.shortestPathDfs(this.characterTile, this.targetTile || this.exitTile); }
    else this.shortestPath = null

    const output = this.#tiles.reduce((string, row, i) => {
      return `${string}\n${row.map(tile=> {
    
      if (tile.isPathNode == true && !tile.hasCharacter) { return '.'; } 
        
        return tile.hasCharacter === true ? CHARACTER_SYMBOLS.get(this.directionMoving || 'right') : tile.symbol;
      }).join('')}`;
    }, '');

    return output;
  }

  getUnvisitedNeighbors(tile) {
    return (Object.entries(this.findNeighbors(tile)) || []).filter(([k, v]) => !v.previous);
  }

  setTargetTile(row, column) {
    // return this.shortestPathDfs(this.characterTile, target)
    this.targetTile = this.tile(+row, +column)

    // console.warn('this.tile(+row, +column)',
    // this.tile(+row, +column)
    // )
    // console.log('this.setTargetTile', this.targetTile)
    let pathNode = this.shortestPathDfs(this.characterTile, this.setTargetTile)

    // while (pathNode) {
    //   fn(pathNode);
    //   pathNode = pathNode.previous;
    // }

    // console.warn('traversePathTiles pathNode', { pathNode })

    return pathNode;
  }


  traversePathTiles(fn) {
    let pathNode = this.shortestPath();

    while (pathNode) {
      fn(pathNode);
      pathNode = pathNode.previous;
    }

    // console.warn('traversePathTiles shortestPathDfs', shortestPathDfs)

    return pathNode;
  }

  shortestPathDfs(tile = this.characterTile, stopNode = this.targetTile || this.exitTile) {
    // console.warn('shortestPathDfs', { start: tile.position, stop: stopNode.position })
    if (tile === stopNode) return tile;

    let unvisitedNeighbors = this.getUnvisitedNeighbors(tile);
    tile.isPathNode = true;

    if (unvisitedNeighbors.length == 0 && tile.previous) {
      tile.isPathNode = false;
      tile = tile.previous;

      unvisitedNeighbors = this.getUnvisitedNeighbors(tile);

      while (tile && unvisitedNeighbors.length === 0) {
        tile.isPathNode = false;
        tile = tile.previous;

        unvisitedNeighbors = this.getUnvisitedNeighbors(tile);
      }

      return this.shortestPathDfs(tile, stopNode);
    }

    else {
      this.cnt = (this.cnt || 0) + 1;

      for (var [direction, neighbor] of unvisitedNeighbors) {
        neighbor.previous = tile;

        if (neighbor === stopNode) return neighbor;

        if (neighbor !== stopNode && unvisitedNeighbors.length > 0) {
          return this.shortestPathDfs(neighbor, stopNode);
        }

        else {
          return tile
        }
      }
    }

    return tile; /* If no path, return null */
  };

  shortestPathBfs(startNode = this.characterTile, stopNode = this.exitTile) {
    const previous = new Map();
    const visited = new Set();
    const queue = [];

    queue.push({ node: startNode, dist: 0 });

    visited.add(startNode);

    while (queue.length > 0) {
      const {
        node,
        dist
      } = queue.shift();

      if (node === stopNode) return { shortestDistande: dist, previous };

      const neighbors = Object.entries(this.findNeighbors(node))
      log
      for (let [dirName, neighbor] of neighbors) {
        // for (let neighbor of neighbors) {
        // const dirName = this.getDirName(node, neighbor);
        neighbor.direction = dirName

        if (!visited.has(neighbor)) {
          previous.set(neighbor, node);
          queue.push({ node: neighbor, dist: dist + 1 })
          visited.add(neighbor);
        }
      }
    }

    return { shortestDistance: -1, previous };
  };

  #deriveTiles() {
    return this.#tiles.reduce((tiles, row, i) => [...tiles, ...row], []);
  }

  #deriveColumns() {
    let cols = [];

    for (let col = 0; col <= this.columnCount; col++) {
      cols = [...cols, this.column(col)];
    }

    return cols;
  }
}
