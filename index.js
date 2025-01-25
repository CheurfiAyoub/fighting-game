const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); //canvas context

canvas.width = 1024; //taille du rectangle de jeux
canvas.height = 576;

//appelle api pour dessiner un rectangle qui commence de 0,0 (en haut a gauche) et prend tout le canvas
c.fillRect(0, 0, canvas.width, canvas.height);

//tant que l'objet est dans les air, donne une vitesse a la velocity y
const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 160,
  },
  imageSrc: "./img/shop.png",
  scale: 2.5,
  framesMax: 6,
});

//nouvel objet de la classe Fighter
const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./samouraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./samouraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./samouraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./samouraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./samouraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./samouraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./samouraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./samouraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 157.5,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 170,
  },
  sprites: {
    idle: {
      imageSrc: "./kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -171,
      y: 50,
    },
    width: 150,
    height: 50,
  },
});

console.log(player);

const keys = {
  q: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

let lastKey;

decreaseTimer();

//fonction pour animer les sprite
function animate() {
  window.requestAnimationFrame(animate); //une fonction qui va loop encore et encore
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height); //defini la fin du canvas
  background.update();
  shop.update();
  c.fillStyle = "rgba(255, 255, 255, 0.15";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  //player movement

  if (keys.q.pressed && player.lastKey === "q") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  //jumping player
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  //enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  //jumping enemy
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  //detect for colision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }

  //if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  //detect for colision & player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }

  //if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  //end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

//un listener qui écoute donc les touche de notre clavier qui sont appuyer
window.addEventListener("keydown", (event) => {
  //player keys
  if (!player.dead) {
    switch (event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "q":
        keys.q.pressed = true;
        player.lastKey = "q";
        break;
      case "z":
        player.velocity.y = -20;
        break;
      case " ":
        player.attack();
        break;
    }
  }
  if (!enemy.dead) {
    switch (event.key) {
      //enemy keys
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "ArrowDown":
        enemy.attack();
        break;
    }
  }
});

//un listener qui écoute donc les touche de notre clavier qui sont relachées
window.addEventListener("keyup", (event) => {
  //player keys
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "q":
      keys.q.pressed = false;
      break;
  }

  //enemy keys
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
