const WIDTH = 800
const HEIGHT = 600

const groundRectangle = new Phaser.Geom.Rectangle(0, HEIGHT - 200, WIDTH - 72, 200) // eslint-disable-line no-unused-vars

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: 'phaser',
  pixelArt: true,
  backgroundColor: '#76EEFE',
  input: {
    gamepad: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

const game = new Phaser.Game(config)
let scene // eslint-disable-line no-unused-vars

const entities = {}
const loops = []

function preload() {
  scene = game.scene.scenes[0]

  this.load.image('ground', 'res/ground.png')
  this.load.image('grid', 'res/grid.png')

  this.load.spritesheet('girl_walk', 'res/girl_walk.png', { frameWidth: 32, frameHeight: 64 })
  this.load.spritesheet('girl_handle', 'res/girl_handle.png', { frameWidth: 32, frameHeight: 64 })

  this.load.spritesheet('gull_fly', 'res/gull_fly.png', { frameWidth: 64, frameHeight: 64 })
  this.load.spritesheet('gull_handle', 'res/gull_handle.png', { frameWidth: 64, frameHeight: 64 })
  this.load.spritesheet('gull_eating', 'res/gull_eating.png', { frameWidth: 64, frameHeight: 64 })

  this.load.spritesheet('turtle_born', 'res/turtle_born.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('turtle_walk', 'res/turtle_walk.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('turtle_fear', 'res/turtle_fear.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('turtle_dead', 'res/turtle_dead.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('turtle[50]_fear', 'res/turtle50_fear.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('turtle_eated', 'res/turtle_eated.png', { frameWidth: 32, frameHeight: 32 })

  this.load.image('white', 'res/particles/white.png')
}

function create() {
  this.add.image(0, HEIGHT - 243, 'ground').setOrigin(0)
  if (config.physics.arcade.debug)
    this.add.image(0, HEIGHT - 300, 'grid').setOrigin(0).setAlpha(0.5)

  const girl = new Girl(128, 444)
  const gulls = new Gulls()
  const turtles = new Turtles()

  gulls.spawn()
  turtles.spawn()

  entities.cursors = this.input.keyboard.createCursorKeys()
  loops.push(girl.loop)
  loops.push(gulls.loop)
  loops.push(turtles.loop)

  entities.zone = this.add.zone(WIDTH + 32, HEIGHT - 200).setSize(200, 200).setOrigin(0)
  this.physics.world.enable(entities.zone)

  this.physics.add.collider(entities.girl, [entities.turtles, entities.gulls])
  this.physics.add.collider(entities.turtles)//, entities.gulls)
  this.physics.add.overlap(entities.turtles, entities.gulls)
  this.physics.add.overlap(entities.turtles, entities.zone)

  entities.score = this.add.text(5, HEIGHT - 25, '', { color: 'white', fontSize: 24 }).setOrigin(0)
  entities.score.label = 'Score: '
  entities.score.value = 0
  entities.numturtle = this.add.text(5, 5, '', { color: 'white', fontSize: 24 }).setOrigin(0)
  entities.numturtle.label = 'Turtle in danger: '

  this.physics.world.on('overlap', (go1, go2, body1, body2) => {
    if (go1.isTurtle && go2.isGull && go2.texture.key !== 'gull_flying') {
      go2.anims.play('gull_eating', true)
      go2.flipX = (go1.x > go2.x)

      if (go1.texture.key !== 'turtle_eated')
      go1.anims.play('turtle[50]_fear', true)
      go1.isAttacked = true

      const deltaX = (go2.flipX ? (go1.width / 2 - 4) : -go1.width / 2 - 6)
      const expectedX = go1.x - deltaX
      const expectedY = go1.y - (go2.height - go1.height) / 2 - 5

      if ((Math.round(expectedY) !== Math.round(go2.y) ||
          Math.round(expectedX) !== Math.round(go2.x)) &&
          !go2.isTweenEnable) {
        go2.isTweenEnable = true
        const tweens = this.tweens.add({
          targets: go2,
          props: {
            x: { value: expectedX },
            y: { value: expectedY }
          },
          duration: 300,
          ease: 'linear',
          complete: 500,
          onComplete: () => {
            go1.anims.play('turtle_eated', true)
            go2.isTweenEnable = false

            tweens.stop()
          }
        })
      }
    }
  })

  /* entities.gull.push(this.add.sprite(750, 300, 'gull_fly'))//.setScale(1.5)

  this.tweens.add({
      targets: entities.gull[0],
      props: {
          x: { value: -200, flipX: true },
          y: { value: 300 },
      },
      duration: 4000,
      ease: 'Sine.easeInOut'
  })

  entities.gull[0].anims.load('fly')
  entities.gull[0].anims.play('fly') */

/*
  mysprite = this.add.image(32, 32, 'gull_fly', '__BASE').setOrigin(0)
  entities.gull = mysprite.animations.add('gull_fly')

  this.animations.play('gull_fly', 30, true)

  entities.gull.setVelocity(200, 0)
  entities.gull.body.allowGravity = false */
}

function update() {
  loops.forEach((loop) => loop.apply(this))

  if (!entities.turtles.getChildren().length) {
    const gulls = new Gulls()
    const turtles = new Turtles()

    gulls.spawn()
    turtles.spawn()

    this.physics.add.collider(entities.girl, [entities.turtles, entities.gulls])
    this.physics.add.collider(entities.turtles)//, entities.gulls)
    this.physics.add.overlap(entities.turtles, entities.gulls)
    this.physics.add.overlap(entities.turtles, entities.zone)
  }

  entities.score.setText(entities.score.label + entities.score.value)
  entities.numturtle.setText(entities.numturtle.label + entities.turtles.getChildren().length)
}
