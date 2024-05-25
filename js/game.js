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
        lifeSign: document.querySelector('.hearts'),
        endPic: document.querySelector('.gameOverPic')
       }
    gGame.clock.innerText = ''
    updateMinesOnBoardSign()
    rederBoard(gGame.level.size)
}


function tellTime (){
    var endDate   = new Date()
    var time = Math.floor((endDate.getTime() - gGame.startTime.getTime()) / 1000).toString()
    var timeHTML = ''
    for (var i = 0; i < time.length; ++i) {
        timeHTML += `<img class="nums" src="imgs/nums/${time[i]}.png" alt="${time[i]}"></img>`
    }
    gGame.clock.innerHTML = timeHTML
    return time
}

function OnRestart(){
    gGame.life = 0
    updateLifeSign()
    clearEndPIcInterval()
    if (gGame.timeInterval) stopClock()
    setTimeout(onInit, 300)
}

function updateMinesOnBoardSign() {
    if (!gGame.isOn)  gGame.markMinesSign.innerText = ''
    else gGame.markMinesSign.innerText  = gGame.level.numOfMines - gGame.markedCount
}  

function winning() {
    if (gGame.shownCount === Math.pow(gGame.level.size, 2) - gGame.level.numOfMines &&
    gGame.markedCount === gGame.level.numOfMines) {
        setEndPic(WON)
        stopClock()
        var score = tellTime()
        gGame.isOn = false
        gGame.endPicInterval = setInterval(onOffSign, 800, WON)
    }
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
    gGame.endPicInterval = setInterval(onOffSign, 800)
    gGame.isOn = false
}

function setEndPic(cenario) {
    if (cenario === WON) {
        gGame.endPic.src = 'imgs/crown.png'
    }
    if (cenario === LOST) {
        gGame.endPic.src = 'imgs/gameover.png'
    } 
    gGame.endPic.style = 'display: block'
}

function removeEndPic() {
    gGame.endPic.style = 'display: none'
}

function onOffSign() {
    gGame.endPic.style = 'display: block'
    setTimeout(removeEndPic, 400)
}

function clearEndPIcInterval() {
    if (gGame && gGame.endPicInterval) {
        clearInterval(gGame.endPicInterval)
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


function stopClock() {
    clearInterval(gGame.timeInterval)
}

function levelChoice(){
    var selections = document.querySelectorAll('input')
    for (var i = 0; i < selections.length; i++)
        if (selections[i].checked) {
            return selections[i].value
        }
}