import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { getModelIdCreator } from '../store/create-model-id.js';
const { utils, text, json, array } = ham;
// console.warn('{ utils, text, json, array }', { utils, text, json, array })
// console.log('utils', utils)
// const utilsJson = JSON.stringify(utils, null, 2)

const promVals = [
  () => console.log('fuck'),
  () => console.log('shit'),
  () => console.log('pisd'),
]

const promiseArray = utils.promisify(...promVals)
// console.log('promiseArray', promiseArray())


// const stringify = (a) => {
//   return a.toString()
// };


const stringify = (obj, name = 'unnamed') => {
  console.log('obj.constructor.name', obj.constructor.name)
  let lineCnt = 0
  const stringedProps = Object.entries(obj)
    .reduce((acc, [key, value], i) => [
      ...acc,
      value.toString().split('\n')
        .filter(_ => !!_.trim())
        .map((line, i) => ++lineCnt + '  ' + line.replace('  ', ''))
        .join('\n')
      ], [])
    .join(',\n\n');

  return stringedProps
  
  return JSON.stringify(stringedProps, null, 2)
};


const renderJson = (json, selector = '#json') => {
  const outputEl = document.querySelector(selector);
  outputEl.innerHTML = `${json}`;
};

// const stringedUtils = jsonify(utils)
renderJson(stringify(utils))


const createTileId = getModelIdCreator('t')
let cnt = 0
const o = {}

setInterval(() => {
  console.warn(`[createTileId] ${++cnt}: `, createTileId());
}, 1000)
