var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

const game = new Phaser.Game(config) // eslint-disable-line no-unused-vars

const obj = {}

function preload() {
  // this.load.image('A321', 'res/A321neo_CFM_AIB_VR.png');
  this.load.image('A321', 'https://airbus-h.assetsadobe2.com/is/image/content/dam/channel-specific/website-/products-and-services/aircraft/aircraft_specifications/passengers/A321neo_CFM_AIB_VR.png?wid=123&fit=constrain,1&fmt=png-alpha')

  this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png')
  this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png')
  this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png')
}

function create() {
  this.add.image(400, 300, 'sky')

  const particles = this.add.particles('red')

  const emitter = particles.createEmitter({
    speed: 100,
    scale: { start: 1, end: 0 },
    blendMode: 'ADD'
  })

  const logo = this.physics.add.image(400, 100, 'logo')

  logo.setVelocity(100, 200)
  logo.setBounce(1, 1)
  logo.setCollideWorldBounds(true)

  emitter.startFollow(logo)

  obj.A321 = this.physics.add.image(-312, 444, 'A321')

  obj.A321.setVelocity(300, 0)
  obj.A321.body.allowGravity = false
}

function update() {
  this.physics.world.wrap(obj.A321, 150)
}
