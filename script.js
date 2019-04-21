'use strict';
// TODO: USE SHADERS

let genetic
let ctx, canvas
let width, height
let viewX = 0
let viewY = 0
let haut, bas, droite, gauche


// TODO: A mettre en parametre changeables ?
// Reproduce => baby in belly, mother loses size, father loses size when reproducing
const CAMERA_SPEED = 15
const MAP_SIZE_X = 4000
const MAP_SIZE_Y = 4000
const FOOD_SIZE = 5
const FOOD_GAIN = 3
const FOOD_SCARCITY = 0 // 1 => no food, 0 => food +/- = SIZE_INITIAL_FOOD
const INIT_CREATURE_SIZE = 8
const FOOD_LOSS_EPOCH = 100
const SIZE_INITIAL_POPULATION = 25000
const SIZE_INITIAL_FOOD = 500
const PI_TWO = 2 * Math.PI

const init = () => {
  width = window.innerWidth
  height = window.innerHeight

  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width = width
  ctx.canvas.height = height

  genetic = new Genetic()
  console.log(genetic)

  loop()
}

// Simulation loop
const loop = () => {
  genetic.movePopulation() // Move the creatures + eventually eat food close enough
  genetic.incrementTimer() // Increment simulation timer
  genetic.generateFood() // Add random food

  genetic.removeDead() // Remove the dead creatures

  moveCamera() // Move the camera
  genetic.draw() // Draw the simulation
  requestAnimationFrame(loop) // Repeat..
}

class Creature {
  constructor() {
    this.gender = Math.random() > 0.5 ? "female" : "male"
    this.x = Math.random() * MAP_SIZE_X
    this.y = Math.random() * MAP_SIZE_Y
    this.speedX = 0
    this.speedY = 0
    this.belly = INIT_CREATURE_SIZE
    this.DNA = new Brain()
  }

}

const dst = (x1, y1, x2, y2) => Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) )

class Brain {
  constructor() {
    this.weights = {
      eating: -1 + 2*Math.random(),
      mating: -1 + 2*Math.random(),
      fighting: -1 + 2*Math.random(),
      runningAway: -1 + 2*Math.random()
    }
  }

  // TODO: Use log(dst) or dst ??
  // ! plus pres => plus de chance de se rapprocher
  makeDecision(nearestFood, nearestMate, nearestEnnemi) {
    let eat = this.weights.eating * nearestFood
    let mate = this.weights.mating * nearestMate
    let fight = this.weights.fighting * nearestEnnemi
    let runAway = this.weights.runningAway * nearestEnnemi

    // return max des 4..
  }
}

class Genetic {
  constructor() {
    this.timer = 0
    this.nbCreatures = SIZE_INITIAL_POPULATION
    this.population = []
    this.initPopulation()
    this.idFood = 0
    this.food = []
    this.initFood()
  }

  initPopulation() {
    for (let i = 0; i < this.nbCreatures; i++) {
      this.population.push(new Creature())
    }
  }

  initFood() {
    for (let i = 0; i < SIZE_INITIAL_FOOD; i++) {
      this.food.push({id: this.idFood, x: Math.random() * MAP_SIZE_X, y: Math.random() * MAP_SIZE_Y})
      this.idFood++
    }
  }

  movePopulation() {
    this.population.forEach( creature => {
      let nearestFood = this.nearestFood(creature)
      // let nearestMate = genetic.nearestMate(creature)
      // let nearestEnnemi = genetic.nearestEnnemi(creature)
      // let target = creature.brain.makeDecision(nearestFood)

      // Move creature
      let x = nearestFood.x - creature.x
      let y = nearestFood.y - creature.y
      let angle = Math.atan2(y, x) * 180 / Math.PI

      creature.x += Math.cos(angle * Math.PI/180) * 10/(10+creature.belly)
      creature.y += Math.sin(angle * Math.PI/180) * 10/(10+creature.belly)

      // Eat food close enough
      let distance = dst(creature.x, creature.y, nearestFood.x, nearestFood.y)
      if (distance < creature.belly + FOOD_SIZE) {
        this.food = this.food.filter( food => food.id != nearestFood.id)
        creature.belly += FOOD_GAIN
      }
    })
  }


  // TODO: Handle empty food list
  nearestFood(creature) {
    let nearest = this.food[0]
    let bestDst = dst(creature.x, creature.y, nearest.x, nearest.y)
    this.food.forEach( food => {
      let distance = dst(creature.x, creature.y, food.x, food.y)
      if (distance < bestDst) {
        nearest = food
        bestDst = distance
      }
    })
    return nearest
  }

  incrementTimer() {
    this.timer++
    if (this.timer % FOOD_LOSS_EPOCH === 0) this.population.forEach( creature => creature.belly-- )
  }

  removeDead() {
    this.population.forEach( (creature, index) => {
      if (creature.belly === 0) this.population.splice(index, 1)
    })
  }

  generateFood() {
    let ratioInitial = this.food.length / SIZE_INITIAL_FOOD
    if (Math.random() > ratioInitial + FOOD_SCARCITY) {
      this.food.push({id: this.idFood, x: Math.random() * MAP_SIZE_X, y: Math.random() * MAP_SIZE_Y})
      this.idFood++
    }
  }

  draw() {
    ctx.clearRect(0, 0, width, height)

    // Draw creatures
    this.population.forEach( creature => {
      ctx.beginPath()
      ctx.fillStyle = creature.gender === "female" ? "#cc00aa" : "#0000dd"
      ctx.arc(creature.x + viewX, creature.y + viewY, creature.belly, 0, PI_TWO)
      ctx.fill()
    })

    // Draw food
    ctx.strokeStyle = "#000000"
    this.food.forEach( food => {
      ctx.beginPath()
      ctx.arc(food.x + viewX, food.y + viewY, FOOD_SIZE, 0, PI_TWO)
      ctx.stroke()
    })

    // Draw lines
    ctx.strokeStyle = "#000000"
    // Lignes horizontales
    if(viewY > 0) { // Gestion < et > 0
      for (let i = 0; i < height/100; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i*100 + Math.abs(viewY%100))
        ctx.lineTo(width, i*100 + Math.abs(viewY%100))
        ctx.stroke()
      }
    }
    else{
      for (let i = 0; i < height/100; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i*100 + Math.abs(-100-viewY%100))
        ctx.lineTo(width, i*100 + Math.abs(-100-viewY%100))
        ctx.stroke()
      }
    }
    // Lignes verticales
    ctx.strokeStyle = "#ff0000"
    if (viewX > 0) {
      for (let i = 0; i < width/100; i++) {
        ctx.beginPath()
        ctx.moveTo(i*100 + Math.abs(viewX%100), 0)
        ctx.lineTo(i*100 + Math.abs(viewX%100), height)
        ctx.stroke()
      }
    }
    else{
      for (let i = 0; i < width/100; i++) {
        ctx.beginPath()
        ctx.moveTo(i*100 + Math.abs(-100-viewX%100), 0)
        ctx.lineTo(i*100 + Math.abs(-100-viewX%100), height)
        ctx.stroke()
      }
    }
  }
}




document.onkeydown = e => {
	if (e.keyCode == 90) haut 	= 	true
	if (e.keyCode == 68) droite = 	true
	if (e.keyCode == 83) bas 	  = 	true
	if (e.keyCode == 81) gauche = 	true
}
document.onkeyup = e => {
	if (e.keyCode == 90) haut 	= 	false
	if (e.keyCode == 68) droite = 	false
	if (e.keyCode == 83) bas 	  =	  false
	if (e.keyCode == 81) gauche = 	false
}

// TODO: use english instead
const moveCamera = () => {
	if (haut 	  == true) viewY += CAMERA_SPEED
	if (droite  == true) viewX -= CAMERA_SPEED
	if (bas 		== true) viewY -= CAMERA_SPEED
	if (gauche  == true) viewX += CAMERA_SPEED

  // if(Me.x > jeu.sizeX) {Me.x = jeu.sizeX; Me.translateX = -(jeu.sizeX - width/2) }
  // if(Me.x < 0        ) {Me.x = 0        ; Me.translateX =  width/2               }
  // if(Me.y > jeu.sizeY) {Me.y = jeu.sizeX; Me.translateY = -(jeu.sizeY - height/2)}
  // if(Me.y < 0        ) {Me.y = 0        ; Me.translateY =  height/2              }
}

window.addEventListener('load', init)
// window.addEventListener('resize', resize)
