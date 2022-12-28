import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { SMALLESTMAZE, BIGMAZE } from './maps/maze-maps.js';
import { MAP_TILE_SYMBOLS, DIRECTIONS, CHARACTER_SYMBOLS } from './lib/Constants.js';
import { TileFactory } from './store/tile-factory.js';
import { MapLocationModel, Model, MapModel } from './store/models/index.js';
import { ControlBarView } from './view/control-bar.view.js';
import { runPath } from './lib/run-path.js';
import { MapConverter } from './lib/map-converter.js';

const { download, template, TwoWayMap, date, array, utils, text } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { startWith, distinctUntilChanged, takeWhile, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


const mapConverter = new MapConverter();


const bigMapRowsToObject = mapConverter.stringRowsToMap(BIGMAZE)

console.warn('bigMapRowsToObject', bigMapRowsToObject)

const bigMapObjectToRows = mapConverter.mapToStringRows(bigMapRowsToObject.map)
console.warn('bigMapObjectToRows', bigMapObjectToRows)

const DEFAULT_MAP_DIMS = {
  columns: 25,
  rows: 25,
}


export class AppController {
  #activeMap;
  #mapModel;
  #mapControls;
  #buttonEvents$;

  constructor(looper = runPath) {
    this.initialize();
    this.pathState = this.setPathState(looper);
    this.looper = looper;

    this.#mapModel = MapModel.create({ dims: DEFAULT_MAP_DIMS }, (tiles) => {});

    this.#activeMap = this.#mapModel;

    this.#mapModel.on('map:loaded', (tiles) => {
      this.render()
    });

    this.#mapModel.on('tiles:updated', (updatedTiles = []) => {
      updatedTiles.forEach((model, i) => {
        const tileDom = this.selectViewTile(model.column, model.row);
        this.setTileData(tileDom, model);

        // {
        //   console.groupCollapsed('tiles:updated')
        //   console.log('model', model)
        //   console.log('tileDom', tileDom)
        //   console.groupEnd('tiles:updated');
        // }

      });
    });

    this.#mapControls = new ControlBarView();

    document.querySelector('#load').addEventListener('click', async (e) => {
      const bama3Key = 'm8fz0q8jahe1vwldwbgd';

      const mapData = JSON.parse(localStorage.getItem('MAP_MAKER')) 
      const bama3Rows = mapData.savedMaps[bama3Key];
      console.warn('mapData', bama3Rows)
      download('all-maps.json', JSON.stringify(mapData, null, 2))
      
      
      let allMaps = await (await fetch('./all-maps.json')).json();
      
       jsonMaps = JSON.stringify(allMaps, null, 2)
      
      const preTag = `<pre style="user-select:text;">${jsonMaps}</pre>`
     localStorage.setItem('MAP_MAKER', jsonMaps)
      document.querySelector('#app').innerHTML = preTag
      // const bama3Map = mapConverter.mapToStringRows(bama3Rows)
      // this.loadMap(bama3Map);
    });
  }

  get #characterTile() { return document.querySelector("[data-has-character='true']") }

  get #mapView() { return document.querySelector('.maze') }

  get activeMap() { return this.#mapModel }

  initialize() {
    if (!this.#mapView) {
      const appbody = document.querySelector('#app-body')
      const mapEl = document.createElement('div');

      mapEl.classList.add('maze');
      appbody.innerHTML = '';
      appbody.append(mapEl)
    }
  }

  loadMap(map) {
    this.#mapModel.load(map);
    // this.render()
    this.setEventHandling.bind(this)();

  }

  render(gameOver = false) {
    let tiles = null;

    this.#mapView.innerHTML = '';

    if (gameOver) { this.#mapView.textContent = 'VERY GOOD'; }

    else {
      this.loadTiles()
      this.#mapView.style.gridTemplateRows = `repeat(${this.#mapModel.height}, 32px)`
      this.#mapView.style.gridTemplateColumns = `repeat(${this.#mapModel.width}, 32px)`;
    }

    console.warn('[ APP ]: Render', this);
    // console.warn('getPath', this.#mapModel.getPath())
  }

  selectViewTile(column, row) {
    if ([column, row].includes(undefined)) return;
    return this.#mapView.querySelector(`.tile[data-column='${column}'][data-row='${row}']`);
  }

  createMapTile(model, options = {}) {
    const tile = this.setTileData(template('tile'), model)

    // tile.textContent = (model.isStart || model.isExit) && model.hasCharacter ? '<' : model.symbol;

    return tile;
  }

  insertTile(tile = document.createElement('div'), before) {
    if (!before) { this.#mapView.append(tile) }

    else if (typeof before === 'number') {
      this.#mapView.insertAdjacentElement(before, tile)
    }

    else { this.#mapView.insertBefore(tile, before) }

    return tile;
  }

  loadTiles(options = {}) {
    this.#mapModel.tiles
      .forEach((row, i) => {
        row.forEach((tileModel, i) => {
          this.insertTile(this.createMapTile(tileModel))
        });
      });
  }

  setTileData(tile, data = {}) {
    if (!tile) return;

    const { symbol, tileType, tileTypeId, row, column, address, hasCharacter, isTarget, isExit, isStart, isPathNode } = data

    Object.assign(
      tile.dataset, {
        symbol,
        tileType,
        tileTypeId,
        row,
        column,
        address,
        hasCharacter,
        isTarget,
        isExit,
        isStart,
        isPathNode
      });

    return tile;
  }

  setPathState(looper) {
    return (tilePath, activeMap) => {
      this.pathState = {
        tilePath,
        activeMap,
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

  setEventHandling() {
    this.tileClicks$ = fromEvent(this.#mapView, 'click').pipe(
        switchMap(e => of(e).pipe(
          tap(x => console.log('this.tileClicks$', x)),
          tap(() => clearInterval(this.pathState.intervalHandle)),
          tap(() => this.setPathState(this.looper)),
          map(event => event.target.closest('.tile')),
          filter(tile => tile && tile.dataset.tileType != 'barrier'),
          distinctUntilChanged(),
          map(tile => this.#mapModel.setTargetTile(
            +tile.dataset.column, +tile.dataset.row
          )),
          // tap((tile) => this.#mapModel.getPath(tile)),
        )))
      .subscribe();


    this.gameOver$ = this.#mapControls.buttonEventStream$.pipe(
      takeWhile(() => !this.#mapModel.isCharacterInBounds()),
      tap(() => { this.render(true) }),
      tap(x => console.log('GAME OVER', x)),
    );

    this.moveSubscription = merge(this.#mapControls.buttonEventStream$).pipe(
      tap(x => console.warn('moveSubscription', x)),
      filter(_ => _),
      tap(dir => { this.#mapModel.moveCharacter(dir) }),
      tap(x => console.warn('this.#characterTile', this.#characterTile)),
      map(() => this.#characterTile),
      filter(_ => _),

      scan(({ nextScrollRight, nextScrollLeft }, char) => {
        const { innerWidth } = window;
        const { right, left } = char.getBoundingClientRect();

        const currentScreenLeft = left + (nextScrollRight - innerWidth);
        const currentScreenRight = right + (nextScrollLeft - innerWidth);

        console.table(
        {
          currentScreenLeft,
          currentScreenRight,
          // nextScrollLeft,
          // left,
        });

        if (currentScreenLeft >= nextScrollRight) {
          this.#mapView.scroll({ left: nextScrollRight, behavior: 'smooth' });
          nextScrollRight = nextScrollRight + innerWidth;
        }

        if (currentScreenLeft <= nextScrollLeft) {
          this.#mapView.scroll({ right: nextScrollLeft, behavior: 'smooth' });
          nextScrollLeft = nextScrollLeft - innerWidth;
        }

        return { nextScrollRight, nextScrollLeft };
      }, { nextScrollRight: window.innerWidth, nextScrollLeft: 0 }),
    ).subscribe();
  }
}



const app = new AppController(
  runPath
);

app.loadMap(BIGMAZE)