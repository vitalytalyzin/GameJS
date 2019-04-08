'use strict';

class Vector  {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    } 
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}

// --------- Проверка
// const start = new Vector(30, 50);
// const moveTo = new Vector(5, 10);
// const finish = start.plus(moveTo.times(2));

// console.log(`Исходное расположение: ${start.x}:${start.y}`);
// console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
// ---------

class Actor {
  constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(position instanceof Vector)) {
      throw new Error('Не объект типа Vector!');
    } 
    if (!(size instanceof Vector)) {
      throw new Error('Не объект типа Vector!');
    } 
    if (!(speed instanceof Vector)) {
      throw new Error('Не объект типа Vector!');
    }
    this.pos = position;
    this.size = size;
    this.speed = speed;
  }

  act() {}

  get left() {
    return this.pos.x;
  }
  get top() {
    return this.pos.y;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  get type() {
    return 'actor';
  }

  isIntersect(newActor) {
    if (newActor === this) {
      return false;
    } 
    if (!(newActor instanceof Actor)) {
      throw new Error('Исключительно объект типа Actor');
    }

    return this.top < newActor.bottom && this.bottom > newActor.top && this.left < newActor.right && this.right > newActor.left;
  }
}

// --------- Проверка
// const items = new Map();
// const player = new Actor();
// items.set('Игрок', player);
// items.set('Первая монета', new Actor(new Vector(10, 10)));
// items.set('Вторая монета', new Actor(new Vector(15, 5)));

// function position(item) {
//   return ['left', 'top', 'right', 'bottom']
//     .map(side => `${side}: ${item[side]}`)
//     .join(', ');  
// }

// function movePlayer(x, y) {
//   player.pos = player.pos.plus(new Vector(x, y));
// }

// function status(item, title) {
//   console.log(`${title}: ${position(item)}`);
//   if (player.isIntersect(item)) {
//     console.log(`Игрок подобрал ${title}`);
//   }
// }

// items.forEach(status);
// movePlayer(10, 10);
// items.forEach(status);
// movePlayer(5, -5);
// items.forEach(status);
// ---------

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find(actor => actor.type === 'player');
    this.height = this.grid.length;
    this.width = this.grid.reduce((prev, cur) => {
      if (prev > cur.length) {
        return prev;
      } else {
        return cur.length;
      }
    }, 0);
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Не Actor!');
    }
    return this.actors.find((elem) => elem.isIntersect(actor));
  }

  obstacleAt(position, size) {
    if (!(position instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Исключительно объект типа Actor');
    }

    const borderLeft = Math.floor(position.x);
    const borderRight = Math.ceil(position.x + size.x);
    const borderTop = Math.floor(position.y);
    const borderBottom = Math.ceil(position.y + size.y);

    if (borderLeft < 0 || borderRight > this.width || borderTop < 0) {
      return 'wall';
    } 
    if (borderBottom > this.height) {
      return 'lava';
    }

    for (let y = borderTop; y < borderBottom; y++) {
      for (let x = borderLeft; x < borderRight; x++) {
        const gridLevel = this.grid[y][x];
        if (gridLevel) {
          return gridLevel;
        }
      }
    }
  }

  removeActor(actor) {
    const actorIndex = this.actors.indexOf(actor);
    if (actorIndex !== -1) {
      this.actors.splice(actorIndex, 1);
    }
  }

  noMoreActors(typeMoving) {
    return this.actors.findIndex((el) => el.type === typeMoving) === -1;
  }

  playerTouched(typeTouched, actor) {
    if (this.status !== null) {
      return;
    }
    if ((typeTouched === 'lava') || (typeTouched === 'fireball')) {
      this.status = 'lost';
      return;
    }
    if ((typeTouched === 'coin') && (actor.type === 'coin')) {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
      return;
    }
  }
}

// --------- Проверка
// const grid = [
//   [undefined, undefined],
//   ['wall', 'wall']
// ];

// function MyCoin(title) {
//   this.type = 'coin';
//   this.title = title;
// }
// MyCoin.prototype = Object.create(Actor);
// MyCoin.constructor = MyCoin;

// const goldCoin = new MyCoin('Золото');
// const bronzeCoin = new MyCoin('Бронза');
// const player = new Actor();
// const fireball = new Actor();

// const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

// level.playerTouched('coin', goldCoin);
// level.playerTouched('coin', bronzeCoin);

// if (level.noMoreActors('coin')) {
//   console.log('Все монеты собраны');
//   console.log(`Статус игры: ${level.status}`);
// }

// const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
// if (obstacle) {
//   console.log(`На пути препятствие: ${obstacle}`);
// }

// const otherActor = level.actorAt(player);
// if (otherActor === fireball) {
//   console.log('Пользователь столкнулся с шаровой молнией');
// }
// ---------

class LevelParser {
  constructor (glossary = {}) {
    this.glossary = glossary;
  }

  actorFromSymbol (symbol) {
    // (symbol) ? this.glossary[symbol] : undefined;
    return this.glossary[symbol];
  }

  obstacleFromSymbol (symbol) {
    switch (symbol) {
      case 'x':
        return 'wall';
        break;
      case '!':
        return 'lava';
        break;
      default:
        return undefined;
    }
  }

  createGrid (grid) {
    return grid.map(row => row.split('')).map(row => row.map(row => this.obstacleFromSymbol(row)));  
  }

  createActors (grid) {
    return grid.reduce((prev, itemY, y) => {
      itemY.split('').forEach((itemX, x) => {
        let constructor = this.actorFromSymbol(itemX);
        if (typeof constructor === 'function') {
          let actor = new constructor(new Vector(x, y));
          if (actor instanceof Actor) {
            prev.push(actor);
          }
        }
      });
      return prev;
    },[]);
  }

  parse (grid) {
    return new Level(this.createGrid(grid), this.createActors(grid));
  }
}

// --------- Проверка
// const plan = [
//   ' @ ',
//   'x!x'
// ];

// const actorsDict = Object.create(null);
// actorsDict['@'] = Actor;

// const parser = new LevelParser(actorsDict);
// const level = parser.parse(plan);

// level.grid.forEach((line, y) => {
//   line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
// });

// level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));
// ---------

class Fireball extends Actor {
  constructor (position = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(position, new Vector(1, 1), speed);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    const nextPosition = this.getNextPosition(time);
    if (level.obstacleAt(nextPosition, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = nextPosition;
    }
  }
}

// --------- Проверка
// const time = 5;
// const speed = new Vector(1, 0);
// const position = new Vector(5, 5);

// const ball = new Fireball(position, speed);

// const nextPosition = ball.getNextPosition(time);
// console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

// ball.handleObstacle();
// console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);
// ---------

class HorizontalFireball extends Fireball {
  constructor(position = new Vector(0, 0)) {
    super(position, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(position = new Vector(0, 0)) {
    super(position, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(position = new Vector(0, 0)) {
    super(position, new Vector(0, 3));
    this.startPos = this.pos;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(position = new Vector(0, 0)) {
    super(position.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.spring = Math.random(Math.PI * 2);
    this.springDist = 0.07;
    this.springSpeed = 8;
    this.startPos = this.pos;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist)
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(position = new Vector(0, 0)) {
    super(position.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
  }

  get type() {
    return 'player';
  }
}

// --------- Создание и запуск уровня

const schemas = [
  [
    '         ',
    '    |    ',
    ' o       ',
    '!x!      ',
    '    =   | ',
    '      o   o  ',
    '     !x! !x! ',
    ' @       ',
    'xxx!     ',
    '         ',
    '!!!!!!!!!!!!!',
  ],
];

const actorDict = {
  '@': Player,
  'o': Coin,
  'v': FireRain,
  '|': VerticalFireball,
  '=': HorizontalFireball
};

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Молодцом!'));


