import { template } from '../lib/templater.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { TwoWayMap, date, array, utils, text } = ham;
import { SMALLESTMAZE, BIGMAZE } from '../maze-maps.js';
import { MazeModel } from '../MazeModel.js';
// import { bfs } from './shortest-path.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, takeWhile, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const navigate = (pathState) => {
  if ((curr && curr.isExit)) {
    pathState.stop();
    return;
  }

  const { tilePath, activeMaze } = pathState
  console.warn('IN navigate  ------- tilePath, activeMaze', tilePath, activeMaze)

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
      activeMaze.moveCharacter(curr);
      activeMaze.directionMoving = oppositeDir;

      content.innerHTML = '';
      content.textContent = activeMaze.print(false);

      pointer++;
      curr = path[pointer];
    }
  }
};

const setRunPath = (looper) => {
  return (tilePath, activeMaze) => {
    const pathState = {
      tilePath,
      activeMaze,
      current: null,
      intervalHandle: null,
      stop() {
        if (!!this.intervalHandle) {
          clearInterval(this.intervalHandle);
          this.intervalHandle = null
        }
      }
    }
  };

  pathState.intervalHandle = setInterval(() => looper(pathState), 50);

};

const runPath = setRunPath(navigate);

export class AppController {
  #mazeModel;
  #mapControlView;
  #mapDisplay = document.querySelector('.maze');
  #buttonEvents$;

  constructor(mazeModel, mapControlView, looper = runPath) {
    this.#mazeModel = mazeModel;
    this.#mapControlView = mapControlView;
    this.pathState = this.setPathState(looper);
this.looper = looper
    this.tileClicks$ = fromEvent(this.#mapDisplay, 'click')
      .pipe(
        
        tap(() => clearInterval(this.pathState.intervalHandle)),
        tap(() => this.setPathState(this.looper)),
        map(event => event.target.closest('.tile')),
        filter(tile => tile && tile.dataset.tileType != 'barrier'),
        tap(tile => tile.dataset.selected = true),
        distinctUntilChanged(),
        map(tile => this.#mazeModel.setTargetTile(
          +tile.dataset.row, +tile.dataset.column
        )),
        // tap(path => looper(path, this.#mazeModel)),
      )
      // .subscribe()
      


    this.gameOver$ = this.#mapControlView.buttonEventStream$
      .pipe(
        takeWhile(() => !this.#mazeModel.isCharacterInBounds()),
        tap(() => { this.render(true) }),
        tap(x => console.log('GAME OVER', x)),
      );

    this.moveSubscription = merge(this.tileClicks$, this.#mapControlView.buttonEventStream$)
      .pipe(
        filter(_ => _),
        tap(dir => { this.#mazeModel.moveCharacter(dir); }),
        tap(() => { this.render() }),
      )
      .subscribe();
  }

  render(gameOver = false) {
    this.#mapDisplay.innerHTML = '';

    if (gameOver) {
      this.#mapDisplay.textContent = 'VERY GOOD';
    }

    else {
      const tiles = this.createMazeGrid(this.#mazeModel.print())
      tiles.forEach((row, i) => {
        row.forEach((tile, i) => {
          this.#mapDisplay.appendChild(tile)
        });
      });
    }
  }

  setPathState(looper) {
    return (tilePath, activeMaze) => {
      this.pathState = {
        tilePath,
        activeMaze,
        current: null,
        intervalHandle: null,
        stop() {
          if (!!this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null
          }
        }
      }
    };

    this.pathState.intervalHandle = setInterval(() => looper(pathState), 50);

  };


  gameLoop(curr) {
    if ((curr && curr.isExit)) {
      this.pathState.stop();
      return;
    }

    let oppositeDir = oppositeDirMap.get(curr.direction);

    if (pointer < pathLength) {
      moveCounter.textContent = pointer
      activeMaze.moveCharacter(curr);
      activeMaze.directionMoving = oppositeDir;

      content.innerHTML = '';
      content.textContent = activeMaze.print(false);

      pointer++;
      curr = path[pointer];
    }
  }

  createGridTile(symbol, options = {}) {
    const tile = template('tile');
    const data = MAP_SYMBOLS.get(symbol)(options)

    Object.assign(tile.dataset, {
      ...data,
      column: data.position.column,
      row: data.position.row,
    });

    tile.textContent = symbol;

    return tile;
  }

  createMazeGrid(map = []) {
    // console.log('map', map)
    this.mazeEl = document.createElement('div');
    // const mapNormalized = (typeof map[0] === 'string'? row.split('') : row)
    return (typeof map === 'string' ? map.split('\n') : map).map((row, r) => (typeof map[0] === 'string' ? row.split('') : row)
      .map((symb, column) => {
        const id = 'c' + utils.uuid()

        if (characterSymbols.has(symb)) {
          return this.createGridTile(symb, { id, hasCharacter: true, position: { column, row: r } })
        }
        else if (symb.toLowerCase() === 'x') {
          return this.createGridTile('x', { id, isExit: true, position: { column, row: r } });
        }

        return this.createGridTile(symb, { id, hasCharacter: false, position: { column, row: r } });
      })
    ).filter(_ => _.length > 0)
  };

}

export class MazeControlsView {
  #buttons;
  #self;

  constructor() {
    this.buttonEventSubject$ = new BehaviorSubject(null)

    this.buttonEvents$ = fromEvent(this.self, 'click');

    this.buttonEvents$.subscribe(this.buttonEventSubject$);

    this.buttonEventStream$ = this.buttonEventSubject$.asObservable()
      .pipe(
        filter(_ => _ && _.target),
        map(x => x.target.dataset.direction),
        // tap(x => console.log('x', x)),
      );
  }

  get self() {
    if (this.#self) return this.#self;

    this.#self = document.querySelector('#controls');

    return this.#self;
  }

  get buttons() {
    if (this.#buttons) return this.#buttons;

    this.#buttons = document.querySelector('#controls');

    return this.#buttons;
  }
}




const mazeEl = document.createElement('div');
const appbody = document.querySelector('#app-body')
mazeEl.classList.add('maze');




appbody.innerHTML = ''
appbody.append(mazeEl)


const activeMaze = new MazeModel(BIGMAZE, );
const mazeControls = new MazeControlsView();

const app = new AppController(
  activeMaze,
  mazeControls,
  runPath
);
const maze1 = app.createMazeGrid(BIGMAZE)

maze1.forEach((row, r) => {
  row.forEach((tile, c) => {
    mazeEl.style.gridTemplateRows = `repeat(${r+1}, 32px)`
    mazeEl.style.gridTemplateColumns = `repeat(${c+1}, 32px)`;
    mazeEl.append(tile);
  });
});




const exitTile = document.querySelector('.tile[data-is-exit=true]')
const characterTile = document.querySelector('.tile[data-has-character=true]')
setTimeout(() => {
  exitTile.scrollIntoView({ behavior: 'smooth' })
  console.log(' ', );
}, 1000)
setTimeout(() => {
  characterTile.scrollIntoView({ behavior: 'smooth' })
  console.log(' ', );
}, 2500)

console.log('maze1', { maze1 })





// const content = document.querySelector('pre');

// content.innerHTML = '';

// content.textContent = activeMaze.print(true);

const shortestPathDfs = activeMaze.shortestPathDfs;

// setInterval(() => {
//   // activeMaze.characterTile = pathList.shift();
//   // let curr = pathList.pop();
//   activeMaze.moveCharacter(pathList.shift().direction);
//   content.innerHTML = '';
//   content.textContent = activeMaze.print()
//   // console.log('activeMaze.characterTile', activeMaze.characterTile)
//   // console.log(' ', );
// }, 200)






// setTimeout(() => {
//   activeMaze.moveCharacter('down');
//   content.innerHTML = '';
//   content.textContent = activeMaze.print()
//   console.log('activeMaze.characterTile', activeMaze.characterTile)
//   console.log('setTimeout ', );
// }, 6000)distinctUntilChanged
