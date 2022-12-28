import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils } = ham;

let logLabels = []

export const logger = {
  group(label, entries) {
    label = label ? label : `LOG GROUP ${utils.uuid()}`
    logLabels.push(label)
    console.groupCollapsed(label);
    entries.forEach(([msg, data], i) => {
      console.warn(msg || 'data', data)
    });
    
    console.groupEnd(label);
    
  },
  assert(label, entries) {
    label = label ? label : `LOG GROUP ${utils.uuid()}`
    logLabels.push(label)
    console.groupCollapsed(label);
    entries.forEach(([msg, data], i) => {
      console.warn(msg || 'data', data)
    });
    
    console.groupEnd(label);
    
  }
};