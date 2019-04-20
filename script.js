'use strict';

let genetic
let ctx, canvas
let width, height
let sizeX = 300
let sizeY = 300
let viewX = 0
let viewY = 0
let haut, bas, droite, gauche
const CAMERA_SPEED = 15 // TODO: A utiliser

const init = () => {
  width = window.innerWidth
  height = window.innerHeight

  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width = width
  ctx.canvas.height = height

  genetic = new Genetic()
  console.log(genetic)

  loop()
}

const loop = () => {
  genetic.movePopulation()

  moveCamera()
  genetic.draw()
  requestAnimationFrame(loop)
}

class Creature {
  constructor() {
    this.gender = Math.random() > 0.5 ? "female" : "male"
    this.x = Math.random() * sizeX
    this.y = Math.random() * sizeY
    this.speedX = 0
    this.speedY = 0
    this.size = 50
    this.DNA = new Brain()

  }
}

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
  makeDecision(nearestFood, nearestMate, nearestEnnemi) {
    let eat = this.weights.eating * nearestFood
    let mate = this.weights.mating * nearestMate
    let fight = this.weights.fighting * nearestEnnemi
    let runAway = this.weights.runningAway * nearestEnnemi

    return max des 4..
  }
}

class Genetic {
  constructor(nbCreatures = 10) {
    this.nbCreatures = nbCreatures
    this.population = []
    this.initPopulation()
    this.food = []
    this.initFood()
  }

  initPopulation() {
    for (let i = 0; i < this.nbCreatures; i++) {
      this.population.push(new Creature())
    }
  }

  initFood() {
    for (let i = 0; i < 100; i++) {
      this.food.push({x: Math.random() * sizeX, y: Math.random() * sizeY})
    }
  }

  movePopulation() {
    this.population.forEach( creature => {
      creature.x += creature.speedX
      creature.y += creature.speedY
    })
  }

  draw() {
    ctx.clearRect(0, 0, width, height)

    // Draw creatures
    this.population.forEach( creature => {
      ctx.beginPath()
      ctx.fillStyle = creature.gender === "female" ? "#00ff00" : "#0000ff"
      ctx.arc(creature.x + viewX, creature.y + viewY, creature.size, 0, 2*Math.PI)
      ctx.fill()
    })

    // Draw food
    ctx.strokeStyle = "#000000"
    this.food.forEach( food => {
      ctx.beginPath()
      ctx.arc(food.x + viewX, food.y + viewY, 5, 0, 2*Math.PI)
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
	if (haut 	  == true) viewY += 15
	if (droite  == true) viewX -= 15
	if (bas 		== true) viewY -= 15
	if (gauche  == true) viewX += 15

  // if(Me.x > jeu.sizeX) {Me.x = jeu.sizeX; Me.translateX = -(jeu.sizeX - width/2) }
  // if(Me.x < 0        ) {Me.x = 0        ; Me.translateX =  width/2               }
  // if(Me.y > jeu.sizeY) {Me.y = jeu.sizeX; Me.translateY = -(jeu.sizeY - height/2)}
  // if(Me.y < 0        ) {Me.y = 0        ; Me.translateY =  height/2              }
}

window.addEventListener('load', init)
// window.addEventListener('resize', resize)
