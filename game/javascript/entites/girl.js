function Girl(x, y) {
  scene.anims.create({
    key: 'girl_walk',
    frames: scene.anims.generateFrameNumbers('girl_walk'),
    frameRate: 4,
    yoyo: true,
    repeat: -1
  })

  scene.anims.create({
    key: 'girl_handle',
    frames: scene.anims.generateFrameNumbers('girl_handle'),
    frameRate: 0.2,
    yoyo: true,
    repeat: -1
  })

  entities.girl = scene.physics.add.sprite(x, y, 'girl_handle').setScale(2)
  entities.girl.setSize(12, 8).setOffset(12, 56)
  entities.girl.setCollideWorldBounds(true)
  entities.girl.body.setBoundsRectangle(groundRectangle)

  entities.girl.anims.play('girl_handle')
}

Girl.prototype.loop = function() {
  let c = false

  if (entities.cursors.left.isDown) {
    entities.girl.setVelocityX(-200)
    entities.girl.play('girl_walk', true)
    entities.girl.flipX = true
    c = true
  } else if (entities.cursors.right.isDown) {
    entities.girl.setVelocityX(200)
    entities.girl.play('girl_walk', true)
    entities.girl.flipX = false
    c = true
  }

  if (entities.cursors.up.isDown) {
    entities.girl.setVelocityY(-200)
    entities.girl.play('girl_walk', true)
    c = true
  } else if (entities.cursors.down.isDown) {
    entities.girl.setVelocityY(200)
    entities.girl.play('girl_walk', true)
    c = true
  }

  try {
    const inputGamepad = this.input.gamepad
    const total = inputGamepad.total
    if (total !== 0) {
      if (total > 1 && !('num_gamepad' in entities)) {
        if ('num_gamepad' in localStorage) {
          entities.num_gamepad = +localStorage.num_gamepad
        } else {
          const names = []
          for (var i = 0; i < total; i++) {
            names.push(i + ') ' + inputGamepad.gamepads[i].id)
          }
          const message = `We detect ${total} gamepads, which do you want to use? `
          const rep = +prompt(message + `num (0-${total - 1}):\n` + names.join('\n'))
          entities.num_gamepad = (isNaN(rep) || rep <= 0 || rep > total) ? 0 : rep
        }

        try {
          navigator.getGamepads()[entities.num_gamepad].vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 200,
            weakMagnitude: 0.2,
            strongMagnitude: 0.4
          })
        } catch (e) {}
      }

      const pad = inputGamepad.getPad(entities.num_gamepad)

      if (pad.axes.length) {
        const axisH = pad.axes[0].getValue()
        const axisV = pad.axes[1].getValue()

        if (axisH !== 0 || axisV !== 0) {
          entities.girl.flipX = (axisH < 0)
          entities.girl.play('girl_walk', true)

          entities.girl.setVelocityX(200 * axisH)
          entities.girl.setVelocityY(200 * axisV)

          c = true
        }
      }
    }
  } catch (e) {
    console.error('gamepad things', e)
    localStorage.clear('num_gamepad')
  }

  entities.girl.depth = entities.girl.y + entities.girl.height

  if (!c) {
    entities.girl.setVelocity(0)
    entities.girl.play('girl_handle', true)
  }
}
