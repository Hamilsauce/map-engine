import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { TwoWayMap, utils } = ham;
// import { bfs, shortestPathBfs } from './shortest-path.js';

const newBarrier = () => ({ symbol: '#', tileTypeId: 0, tileType: 'barrier', isCharacter: false, isPassable: false, })
const newCharacter = () => ({ symbol: '<', tileTypeId: 1, tileType: 'character', isCharacter: true, isPassable: false, })
const newGround = () => ({ symbol: ' ', tileTypeId: 2, tileType: 'ground', isCharacter: false, isPassable: true, })

const DIRECTIONS = {
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
  up: [0, -1],
}

const MAP_SYMBOLS = new Map([
  ['#', ((options = {}) => ({ ...{ symbol: '#', tileTypeId: 0, tileType: 'barrier', direction: null, isCharacter: false, isPassable: false, }, ...options })).bind(this)],
  ['<', ((options = {}) => ({ ...{ symbol: '<', tileTypeId: 1, tileType: 'character', direction: 'left', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
  ['>', ((options = {}) => ({ ...{ symbol: '>', tileTypeId: 1, tileType: 'character', direction: 'right', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
  ['^', ((options = {}) => ({ ...{ symbol: '^', tileTypeId: 1, tileType: 'character', direction: 'up', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
  ['v', ((options = {}) => ({ ...{ symbol: 'v', tileTypeId: 1, tileType: 'character', direction: 'down', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
  [' ', ((options = {}) => ({ ...{ symbol: ' ', tileTypeId: 2, tileType: 'ground', direction: null, isCharacter: false, isPassable: true, }, ...options })).bind(this)],
  ['x', ((options = {}) => ({ ...{ symbol: 'x', tileTypeId: 3, tileType: 'exit', direction: null, isCharacter: false, isPassable: true, isExit: true }, ...options })).bind(this)],
  ['.', ((options = {}) => ({ ...{ symbol: '.', tileTypeId: 4, tileType: 'path', direction: null, isCharacter: false, isPassable: true, isExit: false }, ...options })).bind(this)],
]);

const characterSymbols = new TwoWayMap([
  ['<', 'left'],
  ['>', 'right'],
  ['^', 'up'],
  ['v', 'down'],
]);


export class MazeModel {
  #map;
  #tiles = null;
  #rows = [];
  #columns = null;
  #characterTile = null;
  #exitTile = null;
  #directionMoving = null;


  constructor(map, dirs = DIRECTIONS) {
    if (map) {
      this.#map = this.setMap(map);
    }

    this.dirs = dirs;

    this.shortestPath;
    
  }

  set characterTile(target) {
    if (this.#characterTile) {
      this.#characterTile.hasCharacter = false;
    }

    if (target) {
      this.#characterTile = target
      this.#characterTile.hasCharacter = true;
    }
    else { this.#characterTile = null }
    
    
    console.warn('[MAP MODEL]: Set characterTile',  this.characterTile)
  }

  get characterTile() { return this.#characterTile || null }

  get exitTile() {
    if (this.#exitTile) {
      return this.#exitTile
    }

    this.#exitTile = this.tiles.find((tile, i) => {
      return tile.isExit === true;
      return tile.tileType === 'ground' && !((tile.position.row > 0 && tile.position.row < this.rowCount) &&
        (tile.position.column > 0 && tile.position.column < this.columnCount));
    });

    return this.#exitTile || null;
  }

  get columns() { return this.#columns ? this.#columns : this.#deriveColumns() }

  get tiles() { return this.#tiles ? this.#tiles : this.#deriveTiles() }

  get rows() { return this.#map ? this.#map : [] }

  get firstTile() { return this.tile(0, 0) }

  get columnCount() { return this.map[0].length - 1 }

  get rowCount() { return this.map.length - 1 }

  get lastTile() { return this.tile(this.rowCount, this.columnCount) }

  get occupiedTile() { return this.#characterTile }

  get map() { return this.#map };

  setMap(newMap = [], ) {
    this.#columns = null;

    if (!(newMap && newMap.length)) return;

    this.#map = newMap
      .map((row, r) => row.split('')
        .map((symb, column) => {
          let id = 'c' + utils.uuid()

          if (characterSymbols.has(symb)) {
            this.#characterTile = MAP_SYMBOLS.get(' ')({ id, hasCharacter: true, position: { column, row: r } });

            return this.#characterTile;
          }
          else if (symb.toLowerCase() === 'x') {
            this.#exitTile = MAP_SYMBOLS.get('x')({ id, isExit: true, position: { column, row: r } });

            return this.#exitTile;
          }

          return MAP_SYMBOLS.get(symb)({ id, hasCharacter: false, position: { column, row: r } });
        })
      ).filter(_ => _);

    return this.#map;
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
    if ([row, column].includes(NaN)) return;
    if (this.isOutOfBounds(row, column)) {
      return null;
    } else {
      return this.#map[row][column] || null;
    }
  }

  row(index) {
    return this.#map[index];
  }

  getDirName(tile, offsetCoords = [0, 0]) {
    return Object.entries(DIRECTIONS)
      .filter(([key, coords]) => {
        return offsetCoords[0] === coords[0] && offsetCoords[1] === coords[1]
      })
      .map(([key, coords]) => {
        return key
      })

  }

  moveCharacter(dirNameOrRef) {
    if (typeof dirNameOrRef === 'string') {
      let dirName = dirNameOrRef;

      this.directionMoving = dirName;
      const neighbors = this.findNeighbors(this.characterTile);
     console.log('this.characterTile', this.characterTile)
      // console.log('neighbors', neighbors)
      if (neighbors[dirName]) {
        this.characterTile = neighbors[dirName];
      }
    }
    else {
      this.characterTile = dirNameOrRef;

    }
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
    return this.#map.map((row, i) => this.tile(i, colIndex));
  }

  print(showPath = false) {
    if (showPath) {
      this.shortestPath = this.shortestPathBfs();
    } else this.shortestPath = null

    const output = this.#map.reduce((string, row, i) => {
      return `${string}\n${row.map(_=> {
        if (this.shortestPath && this.shortestPath.previous.has(_)) {
          return '.'
        }
        
        return _.hasCharacter === true ? characterSymbols.get(this.directionMoving || 'left') : _.symbol;
      }).join('')}`;
    }, '');

    return output;
  }

  getUnvisitedNeighbors(tile) {
    return (Object.entries(this.findNeighbors(tile)) || []).filter(([k, v]) => !v.previous);
  }

  shortestPathDfs(tile = this.characterTile, stopNode = this.exitTile) {
    if (tile === stopNode) return tile;
    
    let unvisitedNeighbors = this.getUnvisitedNeighbors(tile)

    if (unvisitedNeighbors.length == 0) {
      tile = tile.previous;

      unvisitedNeighbors = this.getUnvisitedNeighbors(tile)

      while (tile && unvisitedNeighbors.length === 0) {
        tile = tile.previous;

        unvisitedNeighbors = this.getUnvisitedNeighbors(tile)
      }

      return this.shortestPathDfs(tile);
    }

    else {
      this.cnt = (this.cnt || 0) + 1;

      for (var [direction, neighbor] of unvisitedNeighbors) {
        neighbor.previous = tile;
        if (neighbor === stopNode) return neighbor // { path: tile, direction: null }

        if (neighbor !== stopNode && unvisitedNeighbors.length > 0) {
          return this.shortestPathDfs(neighbor);
        }
      }
    }

    // If no path, return null
    return null;
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
    return this.#map.reduce((tiles, row, i) => [...tiles, ...row], []);
  }

  #deriveColumns() {
    let cols = [];

    for (let col = 0; col <= this.columnCount; col++) {
      cols = [...cols, this.column(col)];
    }

    return cols;
  }
}
