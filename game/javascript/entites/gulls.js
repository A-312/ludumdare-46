function Gulls() {
  scene.anims.create({
    key: 'gull_fly',
    frames: scene.anims.generateFrameNumbers('gull_fly'),
    frameRate: 30,
    yoyo: true,
    repeat: -1
  })

  scene.anims.create({
    key: 'gull_eating',
    frames: scene.anims.generateFrameNumbers('gull_eating'),
    frameRate: 20,
    yoyo: true,
    repeat: -1
  })

  scene.anims.create({
    key: 'gull_handle',
    frames: scene.anims.generateFrameNumbers('gull_handle'),
    frameRate: 0.2,
    yoyo: true,
    repeat: -1
  })

  entities.gulls = scene.physics.add.group({
    key: 'gull_handle',
    quantity: 8
  })
}

Gulls.prototype.spawn = function() {
  entities.gulls.getChildren().forEach((entitie) => {
    entitie.isGull = true
    entitie.setSize(48, 32).setOffset(8, 32)
    entitie.body.onOverlap = true
  })

  const gr = groundRectangle

  const rect = new Phaser.Geom.Rectangle(gr.x + 320, gr.y, gr.width - 320, gr.height - 32)
  Phaser.Actions.RandomRectangle(entities.gulls.getChildren(), rect)

  entities.gulls.getChildren().forEach((entitie) => {
    if (entitie.x < 500) {
      entitie.flipX = true
    }
    entitie.anims.play('gull_handle')
  })
}

Gulls.prototype.loop = function() {
  entities.gulls.getChildren().forEach((entitie) => {
    const velocity = entitie.body.velocity
    if (entitie.y >= HEIGHT - 200) {
      if ((velocity.x !== 0 || velocity.y !== 0)) {
        entitie.play('gull_fly', true)
        entitie.flipX = (velocity.x > 0 || (entitie.flipX && velocity.x === 0)) // = don't turn
        if (velocity.y < 20) {
          velocity.y = -200
          velocity.x /= 2
        }
      }
      if (velocity.y > 0) {
        velocity.y *= -1
      }
    }

    if (entitie.texture.key !== 'gull_fly') {
      entitie.depth = entitie.y + entitie.height / 2
    }
  })
}
