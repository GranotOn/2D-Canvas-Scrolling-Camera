class Camera {
  constructor(viewport) {
    this.x = 0;
    this.y = 0;
    this.viewport = viewport;
    this.lerp = 0.1;
  }
  follow(entity) {
    this.follows = entity;
  }

  #lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }
  update(delta) {
    this.x = this.#lerp(
      this.x,
      this.viewport.width / 2 - this.follows.x,
      this.lerp
    );
    this.y = this.#lerp(
      this.y,
      this.viewport.height / 2 - this.follows.y,
      this.lerp
    );
  }
}

class Map {
  constructor(w, h, bg) {
    this.w = w;
    this.h = h;
    this.bg = bg;
  }

  draw(ctx, sx, sy, cw, ch) {
    ctx.drawImage(this.bg, -sx, -sy, cw, ch, 0, 0, cw, ch);
  }
}

class Entity {
  constructor(x, y, width, height, debugColor) {
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
    this.color = debugColor;
  }

  draw(ctx, offsetX, offsetY) {
    ctx.strokeStyle = this.color;
    ctx.strokeRect(this.x + offsetX, this.y + offsetY, this.w, this.h);
  }
}
class Player extends Entity {
  constructor(x, y, width, height, debugColor) {
    super(x, y, width, height, debugColor);
    this.keyMap = {
      ArrowRight: false,
      ArrowLeft: false,
      ArrowUp: false,
      ArrowDown: false,
    };
    this.keyFunctions = {
      ArrowRight: (obj, speed) => (obj.x += speed),
      ArrowLeft: (obj, speed) => (obj.x -= speed),
      ArrowUp: (obj, speed) => (obj.y -= speed),
      ArrowDown: (obj, speed) => (obj.y += speed),
    };
    this.speed = 15;
  }
  update(delta) {
    const ds = this.speed / delta;
    const pressedKeys = Object.keys(this.keyMap).reduce(
      (prev, cur) => (this.keyMap[cur] ? [...prev, cur] : prev),
      []
    );

    pressedKeys.forEach((pk) => this.keyFunctions[pk](this, ds));
  }

  onKeyDown(code) {
    this.keyMap[code] === false && (this.keyMap[code] = true);
  }

  onKeyUp(code) {
    this.keyMap[code] === true && (this.keyMap[code] = false);
  }
}

class Scene {
  constructor(map) {
    this.lastUpdate = 0;
    this.map = map;
  }

  init() {
    // create canvas and append to wrapper
    this.canvas = document.createElement("canvas");
    this.wrapper = document.getElementById("wrapper");
    this.wrapper.appendChild(this.canvas);
    this.#onResize(); // set width & height first time manually

    // add player & entities
    this.player = new Player(500, 400, 60, 90, "#0000ff");
    this.entity = new Entity(300, 605, 50, 50, "#ff5c00");
    this.camera = new Camera(this.canvas);
    this.camera.follow(this.player);

    // add event listeners
    document.addEventListener("resize", this.#onResize);
    document.addEventListener("keydown", (e) => this.#onKeyDown(e));
    document.addEventListener("keyup", (e) => this.#onKeyUp(e));

    this.ctx = this.canvas.getContext("2d");
  }

  #onKeyDown(e) {
    this.player.onKeyDown(e.code);
  }

  #onKeyUp(e) {
    this.player.onKeyUp(e.code);
  }

  #onResize() {
    this.canvas.width = this.wrapper.clientWidth;
    this.canvas.height = this.wrapper.clientHeight;
  }

  update(delta) {
    this.player.update(delta);
    this.camera.update(delta);
  }

  draw() {
    const ctx = this.ctx;

    // clear screen
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // get offsets
    const offsetX = this.camera.x;
    const offsetY = this.camera.y;

    // draw map
    this.map.draw(ctx, offsetX, offsetY, this.canvas.width, this.canvas.height);

    // draw entities
    this.player.draw(ctx, offsetX, offsetY);
    this.entity.draw(ctx, offsetX, offsetY);
  }

  animate(ts) {
    const delta = ts - this.lastUpdate;
    this.update(delta);
    this.draw();
    this.lastUpdate = ts;
    window.requestAnimationFrame((ts) => this.animate(ts));
  }
}

function Init() {
  const bg = new Image();
  bg.src = "Images/BG.png";
  const map = new Map(1500, 2500, bg);
  const scene = new Scene(map);
  scene.init();
  scene.animate();
}

window.onload = (e) => {
  Init();
};
