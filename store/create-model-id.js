import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const {  utils, text } = ham;

// console.log('utils, text', utils, text)

export const createModelId = (prefix) => `${ prefix || 'z' }${ utils.uuid() }`

export const getModelIdCreator = (prefix) => () => createModelId(prefix)//`${ prefix || 'z' }${ utils.uuid() }`
