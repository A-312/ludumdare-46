function Turtles() {
  scene.anims.create({
    key: 'turtle_walk',
    frameRate: 1.3,
    frames: scene.anims.generateFrameNumbers('turtle_walk'),
    repeat: -1
  })
  scene.anims.create({
    key: 'turtle_fear',
    frameRate: 1,
    frames: scene.anims.generateFrameNumbers('turtle_fear'),
    repeat: -1
  })
  scene.anims.create({
    key: 'turtle[50]_fear',
    frameRate: 1,
    frames: scene.anims.generateFrameNumbers('turtle[50]_fear'),
    repeat: -1
  })
  scene.anims.create({
    key: 'turtle_dead',
    frameRate: 1,
    frames: scene.anims.generateFrameNumbers('turtle_dead'),
    repeat: -1
  })
  scene.anims.create({
    key: 'turtle_eated',
    frameRate: 1,
    frames: scene.anims.generateFrameNumbers('turtle_eated'),
    yoyo: false,
    repeat: 0
  }).addListener('complete', (anim, lastframe, gameobject) => {
    const dead = scene.physics.add.sprite(gameobject.x, gameobject.y, 'turtle_dead')
    entities.score.value -= 200
    gameobject.destroy()
  })

  scene.anims.create({
    key: 'turtle_born',
    frames: scene.anims.generateFrameNumbers('turtle_born'),
    frameRate: 5,
    repeat: 0
  }).addListener('complete', (anim, lastframe, gameobject) => {
    const particles = scene.add.particles('white')

    const emitter = particles.createEmitter({
      speed: 100,
      life: 500,
      scale: {
        start: 0.5,
        end: 0
      },
      angle: {
        min: 0,
        max: 360
      },
      x: gameobject.x,
      y: gameobject.y,
      blendMode: 'ADD'
    })

    setTimeout(() => {
      gameobject.play('turtle_walk')
      gameobject.setSize(0, 8).setOffset(0, 24)
      gameobject.body.immovable = false
      gameobject.body.useDamping = true
      gameobject.body.setDrag(0.9)
      emitter.stop()
    }, 100)
  })

  const gr = groundRectangle

  entities.turtles = scene.physics.add.group({
    collideWorldBounds: true,
    customBoundsRectangle: new Phaser.Geom.Rectangle(gr.x + 32, gr.y, WIDTH + 200, gr.height),
    key: 'turtle_walk',
    quantity: 4,
    immovable: true
  })
}

Turtles.prototype.spawn = function() {
  const gr = groundRectangle

  entities.turtles.getChildren().forEach((entitie) => {
    entitie.isTurtle = true
  })
  const rect = new Phaser.Geom.Rectangle(gr.x + 32, gr.y, 280, gr.height - 20)

  Phaser.Actions.RandomRectangle(entities.turtles.getChildren(), rect)

  entities.turtles.getChildren().forEach((entitie) => {
    entitie.anims.play('turtle_born')
  })
}

Turtles.prototype.loop = function() {
  entities.turtles.getChildren().forEach((entitie) => {
    let delta = 0
    entitie.depth = entitie.y
    const velocity = entitie.body.velocity
    if (velocity.x <= 5 && entitie.texture.key === 'turtle_walk') {
      velocity.x = 10 * (entitie.flipX ? -1 : 1)
    }
    if (entitie.isAttacked) {
      delta = -10
    } else if (!entitie.body.touching.none) {
      entitie.play('turtle_fear', true)
      entitie.waitToWalk = +new Date() + 2000
      if (entitie.body.touching.right) {
        entitie.flipX = true
      } else if (entitie.body.touching.left) {
        entitie.flipX = false
      }
    } else if (entitie.waitToWalk < +new Date()) {
      entitie.play('turtle_walk', true)
    }

    entitie.depth = entitie.y + entitie.height / 2 + delta
  })

  if (!entities.zone.body.touching.none && entities.zone.body.wasTouching.none && entities.num_gamepad) {
    try {
      navigator.getGamepads()[entities.num_gamepad].vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 1000,
        weakMagnitude: 0.5,
        strongMagnitude: 1.0
      })
    } catch (e) {}

    entities.turtles.getChildren().forEach((entitie) => {
      if (WIDTH <= entitie.x) {
        entities.score.value += 100
        entitie.destroy()
      }
    })
  }
}
