const navigate = (pathState) => {
  if ((curr && curr.isExit)) {
    pathState.stop();
    return;
  }

  const { tilePath, activeMap } = pathState

  let oppositeDirMap = new TwoWayMap([
    ['up', 'down'],
    ['left', 'right'],
  ]);

  let moveCounter = document.querySelector('#move-count');
  let pointer = 0;
  let pathLength = 0;

  curr = path
  let path = []

  while (curr) {
    path.push(curr)
    pathLength++
    curr = curr.previous
  }

  path.reverse();
  curr = path[pointer];

  const startPathFind = (intervalFn, interval = 80) => {};

  const gameLoop = (pathState) => {
    if ((curr && curr.isExit)) {
      pathState.stop();
      return;
    }

    let oppositeDir = oppositeDirMap.get(curr.direction);

    if (pointer < pathLength) {
      moveCounter.textContent = pointer
      activeMap.moveCharacter(curr);
      activeMap.directionMoving = curr.direction;

      content.innerHTML = '';
      content.textContent = activeMap.print(false);

      pointer++;
      curr = path[pointer];
    }
  }
};

const setRunPath = (looper) => {
  let intervalHandle;
  
  return (tilePath, activeMap) => {
    const pathState = {
      tilePath,
      activeMap,
      current: null,
      intervalHandle: null,
      stop() {
        if (!!intervalHandle) {
          clearInterval(intervalHandle);
          intervalHandle = null
        }
      }
    }
  };

  pathState.intervalHandle = setInterval(() => looper(pathState), 50);

};

export const runPath = setRunPath(navigate);
