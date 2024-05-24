'use strict'
const WON = 'WON'
const LOST = 'LOST'
var gGame
var gLevelChoise
function onInit(){
    clearEndPIcInterval()
    gGame = {
        level: LEVELS[levelChoice()],
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        life: 3,
        startTime: null,
        timeInterval: null,   
        endPicInterval: null,
        clock: document.querySelector('.clock'),
        markMinesSign: document.querySelector('.minesOnBoard'),
        lifeSign: document.querySelector('.hearts')
       }
    gGame.clock.innerText = ''
    updateMinesOnBoardSign()
    rederBoard(gGame.level.size)
}

function tellTime (){
    var endDate   = new Date()
    var time = Math.floor((endDate.getTime() - gGame.startTime.getTime()) / 1000)
    gGame.clock.innerText = time
    return time
}

function updateMinesOnBoardSign() {
    if (!gGame.isOn)  gGame.markMinesSign.innerText = ''
    else gGame.markMinesSign.innerText  = gGame.level.numOfMines - gGame.markedCount
}  

function winning() {
    if (gGame.shownCount === Math.pow(gGame.level.size, 2) - gGame.level.numOfMines &&
        gGame.markedCount === gGame.level.numOfMines) {
        setEndPic(WON)
        // player won
        var score = tellTime()
        stopClock()
        gGame.isOn = false
        gGame.endPicInterval = setInterval(onOffSign, 800, WON)
    }
}

function setEndPic(cenario) {
    var endGame = document.querySelector('.endGame')
    if (cenario === WON) {
        endGame.innerHTML = '<img class="gameOverPic" src="imgs/crown.png">'
        var endPic = document.querySelector('.gameOverPic')
        endPic.style = 'margin-top: 200px;  width: 700px;'
    }
    if (cenario === LOST) {
        endGame.innerHTML = '<img class="gameOverPic" src="imgs/gameover.png"></img>'
        var endPic = document.querySelector('.gameOverPic')
        endPic.style = 'margin-top: 300px;  height: 500;'
    } 
}

function updateLifeSign() {
    if (gGame.life) {
        var txt = ''
        for (var i = 0; i < gGame.life; ++i) {
            txt += '<img class="heart" src="imgs/heart.png" alt="❤️">'
        }
        gGame.lifeSign.innerHTML = txt
    }
    else gGame.lifeSign.innerText = ''
}

function loosing() {
    gGame.markedCount++
    gGame.life--
    updateLifeSign()
    updateMinesOnBoardSign()
    if (gGame.life  > 0) return
    setEndPic(LOST)
    stopClock()
    openAll()
    gGame.endPicInterval = setInterval(onOffSign, 800, LOST)
    gGame.isOn = false
}

function stopClock() {
    clearInterval(gGame.timeInterval)
}


function removeEndPic() {
    var endPic = document.querySelector('.endGame')
    endPic.innerHTML = ''
}

function OnRestart()
    {
        gGame.life = 0
        updateLifeSign()
        clearEndPIcInterval()
        removeEndPic()
        if (gGame.timeInterval) stopClock()
        onInit()
    }


function levelChoice(){
    var selections = document.querySelectorAll('input')
    for (var i = 0; i < selections.length; i++)
        if (selections[i].checked) {
            return selections[i].value
        }
}

function onOffSign(cenario) {
    setEndPic(cenario)
    setTimeout(removeEndPic, 400)
}


function clearEndPIcInterval() {
    if (gGame && gGame.endPicInterval) {
        clearInterval(gGame.endPicInterval)
    }
}