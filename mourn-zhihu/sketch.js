let frameTime = 0 // Time at which the current frame is updated
let oldTime = 0 // Time at which the previous frame is updated
let fpsCooldown = 0 // When fpsCooldown <= 0, set displayFPS = fps
let fps = 1 // Ratio of (1000ms) to (difference between frameTime and oldTime), MUST START WITH 1
let displayFPS = 0 // fps displayed on screen, updated every second

var frameWidth = 400
var frameHeight = 400

var paused = true
var muted = false

var amplitude
var defaultSong
var currentSong

var buttonPlayPause
var buttonLoop
var buttonMute
var buttonDefaultSong
var buttonKaraoke

var imageDian
var imagesSB = []
var sbScale = 0

class GifContainer {
    constructor(scale, updateFunc) {
        this.image = null
        this.static = null
        this.x = null
        this.y = null
        this.scale = scale
        this.update = updateFunc
        this.animationPhase = 0
        this.destinationX = this.x
        this.destinationY = this.y
    }

    standardUpdate() {
        if (this.x === null) {
            if (this.destinationX === null) {
                this.x = -1000
            } else {
                this.x = this.destinationX
            }
        } else if (this.y === null) {
            if (this.destinationY === null) {
                this.y = -1000
            } else {
                this.y = this.destinationY
            }
        } else if (paused) {
            this.image.hide()
            image(this.static, this.x, this.y, this.static.width * this.scale, this.static.height * this.scale)
        } else {
            this.image.show()
            this.image.size(this.static.width * this.scale, this.static.height * this.scale)

            if (this.destinationX !== null) {
                this.x += (this.destinationX - this.x) * 0.2
                if (this.x > this.destinationX - 5 && this.x < this.destinationX + 5) {
                    this.x = this.destinationX
                }
            }
            if (this.destinationY !== null) {
                this.y += (this.destinationY - this.y) * 0.2
                if (this.y > this.destinationY - 5 && this.y < this.destinationY + 5) {
                    this.y = this.destinationY
                }
            }
            this.image.position(this.x, this.y)
        }
    }

    checkSetDestinationXBetweenMargins(left, right) {
        if (this.x === this.destinationX) {
            this.destinationX = windowWidth / 2 - frameWidth / 2 + Math.random() * (frameWidth - this.static.width * this.scale - left - right) + left
        }
    }

    checkSetDestinationYBetweenMargins(top, down) {
        if (this.y === this.destinationY) {
            this.destinationY = 160 + Math.random() * (frameHeight - this.static.height * this.scale / 2 - top - down) + top
        }
    }
}

var gifB = new GifContainer(1, function () {
    this.destinationY = 160 + frameHeight - this.static.height * this.scale
    this.checkSetDestinationXBetweenMargins(-40, -40)
    this.standardUpdate()
})

var gifC = new GifContainer(1, function () {
    this.checkSetDestinationXBetweenMargins(30, 30)
    this.checkSetDestinationYBetweenMargins(10, 60)
    this.standardUpdate()
})

var gifD = new GifContainer(1, function () {
    this.destinationY = 160 + frameHeight - this.static.height * this.scale
    this.destinationX = windowWidth / 2 - this.static.width * this.scale / 2
    this.standardUpdate()
})

var gifE = new GifContainer(0.4, function () {
    this.checkSetDestinationXBetweenMargins(10, 10)
    this.checkSetDestinationYBetweenMargins(10, 30)
    this.standardUpdate()
    if (!paused) {
        this.animationPhase += 23
        if (this.animationPhase > 360) {
            this.animationPhase %= 360
        }
        this.image.style('rotate', 360 - this.animationPhase)
    }
})

var gifF = new GifContainer(0.5, function () {
    this.destinationY = 160 + frameHeight - this.static.height * this.scale
    this.checkSetDestinationXBetweenMargins(240, -30)
    this.standardUpdate()
})

var gifG = new GifContainer(0.5, function () {
    this.destinationY = 160 + frameHeight - this.static.height * this.scale
    this.checkSetDestinationXBetweenMargins(-60, 60)
    this.standardUpdate()
})

var gifH = new GifContainer(1, function () {
    this.destinationY = 160 + frameHeight - this.static.height * this.scale
    this.destinationX = windowWidth / 2 - frameWidth + this.static.width * this.scale / 2 + 160
    this.standardUpdate()
})

var gifI = new GifContainer(0.75, function () {
    this.destinationY = 160 + frameHeight - this.static.height * this.scale
    this.checkSetDestinationXBetweenMargins(240, -30)
    this.standardUpdate()
})

var allGifs = [gifB, gifC, gifD, gifE, gifF, gifG, gifH, gifI]

function preload() {
    imageDian = loadImage('images/dian.png')

    gifB.static = loadImage('images/b.gif')
    gifC.static = loadImage('images/c.gif')
    gifD.static = loadImage('images/d.gif')
    gifE.static = loadImage('images/e.png')
    gifF.static = loadImage('images/f.gif')
    gifG.static = loadImage('images/g.gif')
    gifH.static = loadImage('images/h.gif')
    gifI.static = loadImage('images/i.gif')

    for (var i = 1; i <= 2; i++) {
        imagesSB.push(loadImage(`images/sb-${i}.png`))
    }

    defaultSong = loadSound('audio/ycao.mp3')
}

function setup() {
    // setup() runs once. Put your setup code here.
    createCanvas(windowWidth, windowHeight)

    currentSong = defaultSong
    amplitude = new p5.Amplitude()

    buttonPlayPause = document.getElementById("PlayPause")
    buttonLoop = document.getElementById("LoopButton")
    buttonMute = document.getElementById("MuteButton")
    buttonDefaultSong = document.getElementById("DefaultSong")
    buttonKaraoke = document.getElementById("LingTangKGe")

    gifB.image = createImg('images/b.gif')
    gifC.image = createImg('images/c.gif')
    gifE.image = createImg('images/e.png')
    gifF.image = createImg('images/f.gif')
    gifG.image = createImg('images/g.gif')
    gifH.image = createImg('images/h.gif')
    gifI.image = createImg('images/i.gif')
    gifD.image = createImg('images/d.gif')

}

function draw() {
    // draw() runs every time before a new frame is rendered. 

    // Time updates

    if (!paused && Math.random() < 0.01) {
        nextPhoto()
    }

    frameTime = millis()
    const timeDiff = frameTime - oldTime
    fps = (1000 / (timeDiff) + fps * (fps - 1)) / fps
    textSize(32)
    fpsCooldown -= timeDiff

    // Update

    background(200)

    noStroke()

    var volume = 0
    if (!paused) {
        volume = amplitude.getLevel()
    }

    var visualVolume = volume * 4
    if (sbScale < visualVolume - 0.06) {
        sbScale += 0.1
    } else if (sbScale > visualVolume + 0.06) {
        sbScale -= 0.1
    } else {
        sbScale = visualVolume
    }

    image(imagesSB[0], windowWidth / 2 - frameWidth / 2 - frameWidth / 4 * sbScale, 160 - frameHeight / 4 * sbScale, frameWidth + frameWidth / 2 * sbScale, frameHeight + frameHeight / 2 * sbScale)
    filter(GRAY)
    tint(255, sbScale * 255)
    image(imagesSB[0], windowWidth / 2 - frameWidth / 2 - frameWidth / 4 * sbScale, 160 - frameHeight / 4 * sbScale, frameWidth + frameWidth / 2 * sbScale, frameHeight + frameHeight / 2 * sbScale)
    noTint()

    // Overlay

    fill(20)
    rect(0, 0, windowWidth / 2 - frameWidth / 2, windowHeight)
    rect(windowWidth / 2 + frameWidth / 2, 0, windowWidth / 2 - frameWidth / 2, windowHeight)
    rect(0, 0, windowWidth, 160)
    rect(0, 160 + frameHeight, windowWidth, windowHeight - (160 + frameHeight))

    // Objects

    fill(40)
    rect(windowWidth / 2 - frameWidth / 2 - 10, 200, -160, frameHeight - 20)
    rect(windowWidth / 2 + frameWidth / 2 + 10, 200, 160, frameHeight - 20)

    fill(20)
    stroke(150)
    strokeWeight(16)
    ellipse(windowWidth / 2 - frameWidth / 2 - 90, 300, 100 + 40 * sbScale, 100 + 40 * sbScale)
    ellipse(windowWidth / 2 - frameWidth / 2 - 90, 480, 80 + 32 * sbScale, 75 + 32 * sbScale)
    ellipse(windowWidth / 2 + frameWidth / 2 + 90, 300, 100 + 40 * sbScale, 100 + 40 * sbScale)
    ellipse(windowWidth / 2 + frameWidth / 2 + 90, 480, 80 + 32 * sbScale, 75 + 32 * sbScale)
    noStroke()

    fill(64)
    textSize(48)
    textAlign(CENTER, TOP)
    text("沉 痛", windowWidth / 2 - frameWidth / 2 - 90, 140)
    text("悼 念", windowWidth / 2 + frameWidth / 2 + 90, 140)

    for (gifContainer of allGifs) {
        gifContainer.update()
    }

    if (paused) {
        filter(GRAY)
        image(imageDian, windowWidth / 2 - 80, 160 + frameHeight / 2, 160, 160)
    }

    // Text

    fill(0)
    rect(windowWidth / 2 - 400, 160, -112, frameHeight)
    rect(windowWidth / 2 + 400, 160, 112, frameHeight)

    fill(255, 0, 0)
    textSize(64)

    stroke(255, 255, 255, 30)
    textAlign(CENTER, TOP)
    text("小管家的奇妙灵堂", windowWidth / 2, 40)

    noStroke()
    textSize(72)

    textAlign(RIGHT, TOP)
    text("香\n消\n玉\n殒", windowWidth / 2 - 420, 180)

    textAlign(LEFT, TOP)
    text("梦\n断\n北\n堂", windowWidth / 2 + 420, 180)

    textSize(32)
    textAlign(CENTER, TOP)
    fill(100, 0, 0)
    text("灵堂模拟器 p5.js版 v0.1 beta, powered by Wādogēmu! Media Player", windowWidth / 2, 160 + frameHeight + 100)


    // Display FPS

    if (fpsCooldown <= 0) {
        displayFPS = fps
        fpsCooldown = 1000
    }

    fill(0, 0, 0)
    textAlign(RIGHT, TOP) // Text alignment of the fps label
    textSize(24)
    text(`${Math.floor(displayFPS)} fps`, width - 16, 16) // Position of the fps label

    // Finalizing frame

    oldTime = millis()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function audioStarted() {
    paused = false
}

function audioStopped() {
    paused = true
}

function nextPhoto() {
    imagesSB.push(imagesSB.splice(0, 1)[0])
}

/* ONGAKU PLAYER FUNCTIONALITIES */

function togglePlayPause() {
    paused = !paused
    if (paused) {
        buttonPlayPause.style.background = "url('images/button-play.svg')"
        buttonLoop.style.opacity = 0.3
        currentSong.pause()
    } else {
        buttonPlayPause.style.background = "url('images/button-pause.svg')"
        buttonLoop.style.opacity = 0.8
        currentSong.play()
    }
}

function toggleLoop() {
    currentSong.setLoop(!currentSong.isLooping())
    if (currentSong.isLooping()) {
        buttonLoop.style.background = "url('images/button-loop-on.svg')"
    } else {
        buttonLoop.style.background = "url('images/button-loop-off.svg')"
    }
}

function toggleMute() {
    /*
    muted = !muted
    if (muted) {
        buttonMute.style.background = "url('images/button-audio-off.svg')"
    } else {
        buttonMute.style.background = "url('images/button-audio-on.svg')"
    }
    */
}

function jumpToLocation(location) {
    
}

function useDefaultSong() {
    currentSong = defaultSong
}

function setSong(song) {
    currentSong = song
}

