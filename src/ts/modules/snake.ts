/**
 *  =========[ SNAKE GAME ]==========
 * Just for fun. Play with your keyboard (up, down, left, right)
 * Author: @joecamer , @Dy05
 * I allow you to use this code. It's 100% opensource
 * If you wanted to collaborate, then you are welcome
 *
 * All what I want is a little star
 * For second release by @Dy05.
 * Adding pause with Echap key and Restart game option withou any Style :-P
 */
import Direction from './Direction'
import {Point} from "./point";
import {Block} from "./block";
import {_table, Levels, STEPX, STEPY, tableX, tableY} from "./values";

let isPaused
let isFinished = false

export default class Snake {
  private readonly level: number
  private direction
  private mouse
  private blocks
  private timer
  private state

  constructor(state, props) {
    this.level = props.level - 1 || 1
    this.state = state
    this.initializeComponents()
  }

  initializeComponents() {
    if (isPaused === undefined) {
      isPaused = false
    } else {
      document.querySelectorAll('.block').forEach(elmt => elmt.remove())
    }
    this.mouse = new Point()
    document.querySelector('#level').innerHTML = Levels[this.level].title
    this.direction = Direction.RIGHT
    this.blocks = [
      new Block({
        position: {
          x: STEPX,
          y: STEPY
        },
        isFirst: true
      })
    ]

    for (let i = 0; i < this.level * 2; i++) {
      this.blocks.push(new Block({position: {x: 0, y: STEPY}, range: i + 1}))
    }

  }

  gameOver() {
    const gameOver_box = document.querySelector("#gameOver-box")
    const yesBtn = document.querySelector("#yesBtn")
    const answers = {
      yes: (event) => {
        const {keyCode} = event;
        if (!keyCode || (keyCode && keyCode === 32)) {
          this.state.scores = 0
          this.initializeComponents()
          this.start()
          isFinished = false
          renew()
        }
      },
    }
    const renew = () => {
      gameOver_box.classList.remove("animate__bounceIn")
      gameOver_box.classList.add("animate__bounceOut")
      yesBtn.removeEventListener('click', answers.yes)
      document.body.removeEventListener('keydown', answers.yes)
    }

    this.stop()
    document.body.removeEventListener('keydown', this.keyboardEscEvent)
    document.body.addEventListener('keydown', answers.yes)
    yesBtn.addEventListener('click', answers.yes)

    gameOver_box.className = "gb-visible animate__animated animate__bounceIn"
  }

  walk() {
    const alignedX = this.mouse.position.x === this.blocks[0].position.x
    const alignedY = this.mouse.position.y === this.blocks[0].position.y

    if (alignedX && alignedY) {
      this.increase()
      this.mouse.updatePosition()
      this.state.scores += Levels[this.level].score
    }

    this.blocks.forEach(_ => {
      _table.appendChild(_.el)
    })

    this.blocks.forEach((b, i) => {
      let position

      if (i === 0) {

        switch (this.direction) {
          case Direction.LEFT:
            position = {
              x: b.position.x - STEPX,
              y: b.position.y
            }
            this.blocks[0].el.style.transform = 'rotate(90deg)'
            break
          case Direction.RIGHT:
            position = {
              x: b.position.x + STEPX,
              y: b.position.y
            }
            this.blocks[0].el.style.transform = 'rotate(-90deg)'
            break
          case Direction.TOP:
            position = {
              x: b.position.x,
              y: b.position.y - STEPY
            }
            this.blocks[0].el.style.transform = 'rotate(180deg)'
            break
          case Direction.BOTTOM:
            position = {
              x: b.position.x,
              y: b.position.y + STEPY
            }
            this.blocks[0].el.style.transform = 'rotate(-360deg)'
            break
        }
      } else {
        position = {
          x: this.blocks[i - 1]._position.x,
          y: this.blocks[i - 1]._position.y,
        }
      }
      b.updatePosition(position)
    })
  }

  increase() {
    this.blocks.push(new Block({
      position: this.blocks[this.blocks.length - 1]._position
    }))
  }

  start() {
    this.launch()
    this.play()
    document.body.addEventListener('keydown', this.keyboardEscEvent)
  }

  play() {
    document.body.addEventListener('keydown', this.keyboardControlEvent)
    this.timer = setInterval(() => {
      const maxX = STEPX * 2
      const maxY = STEPY * 2
      const hx = this.blocks[0].position.x + maxX
      const hy = this.blocks[0].position.y + maxY
      const d = this.direction

      if ((hx >= tableX && d === Direction.RIGHT) || (hx <= maxX && d === Direction.LEFT) || (hy >= tableY && d === Direction.BOTTOM) || (hy <= maxY && d === Direction.TOP)) {
        this.gameOver()
      } else {
        let touched = false
        let count = 1

        while (!touched && count < this.blocks.length) {
          touched = (this.blocks[count].position.x === this.blocks[0].position.x) && (this.blocks[count].position.y === this.blocks[0].position.y)
          count++
        }

        if (touched) {
          this.gameOver()
        } else {
          this.walk()
        }

      }
    }, Levels[this.level].speed)
  }

  pauseStop() {
    // Ici on peut creer un div ou une bonne alert qui met le score avec le bouton qui active le confirm
    isPaused = false

    document.querySelector("#pause-box").animate([
      {
        visibility: "visible",
        opacity: 1
      },
      {
        visibility: "hidden",
        opacity: 0
      }
    ], {
      fill: "both",
      duration: 300,
      easing: "ease-in"
    })
    this.play()
  }

  pauseStart() {
    isPaused = true
    this.stop()

    document.querySelector("#pause-box").animate([
      {
        visibility: "hidden",
        opacity: 0
      },
      {
        visibility: "visible",
        opacity: 1
      }
    ], {
      fill: "both",
      duration: 300,
      easing: "ease-in"
    })
  }

  stop() {
    document.body.removeEventListener('keydown', this.keyboardControlEvent)
    clearInterval(this.timer)
  }

  launch() {
    document.body.addEventListener('keydown', this.keyboardControlEvent)
  }

  keyboardControlEvent = ({keyCode}) => {
    switch (keyCode) {
      case 37:
        if (this.direction !== Direction.RIGHT) {

          this.direction = Direction.LEFT
        }
        break
      case 38:
        if (this.direction !== Direction.BOTTOM) {
          this.direction = Direction.TOP
        }
        break
      case 39:
        if (this.direction !== Direction.LEFT) {
          this.direction = Direction.RIGHT
        }
        break
      case 40:
        if (this.direction !== Direction.TOP) {
          this.direction = Direction.BOTTOM
        }
        break
    }
  }

  keyboardEscEvent = ({keyCode}) => {
    if (keyCode === 27) {
      if (!isFinished) {
        if (isPaused) {
          this.pauseStop()
        } else {
          this.pauseStart()
        }
      }
    }
  }
}