import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { TileModel } from './models/tile.model.js';

const { template, utils } = ham;


export const TILE_CONFIGS = new Map([
  ['*', { symbol: '*', tileTypeId: 7, tileType: 'empty', direction: null, hasCharacter: false, isPassable: false, }],
  ['#', { symbol: '#', tileTypeId: 0, tileType: 'barrier', direction: null, hasCharacter: false, isPassable: false, }],
  ['<', { symbol: '<', tileTypeId: 1, tileType: 'ground', direction: 'left', hasCharacter: true, isPassable: true, }],
  ['>', { symbol: '>', tileTypeId: 1, tileType: 'ground', direction: 'right', hasCharacter: true, isPassable: true, }],
  ['^', { symbol: '^', tileTypeId: 1, tileType: 'ground', direction: 'up', hasCharacter: true, isPassable: true, }],
  ['v', { symbol: 'v', tileTypeId: 1, tileType: 'ground', direction: 'down', hasCharacter: true, isPassable: true, }],
  [' ', { symbol: ' ', tileTypeId: 2, tileType: 'ground', direction: null, hasCharacter: false, isPassable: true, }],
  ['$', { symbol: '$', tileTypeId: 3, tileType: 'start', direction: null, hasCharacter: true, isPassable: true, isExit: false, isStart: true }],
  ['x', { symbol: 'x', tileTypeId: 4, tileType: 'exit', direction: null, hasCharacter: false, isPassable: true, isExit: true }],
  ['.', { symbol: '.', tileTypeId: 5, tileType: 'path', direction: null, hasCharacter: false, isPassable: true, isExit: false }],
  ['@', { symbol: '@', tileTypeId: 6, tileType: 'target', direction: null, hasCharacter: false, isPassable: true, isExit: true }],
]);


const getTileConfigBySymbol = (symbol) => {
  const t = TileModel.create(TILE_CONFIGS.get(symbol));
  
  return t;
};

export const TileFactory = {
  bySymbol: getTileConfigBySymbol,
}
