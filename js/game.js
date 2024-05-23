'use strict'
var gGame
var gLevelChoise
function onInit(){
    gGame = {
        level: LEVELS[levelChoice()],
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        life: 3,
        startTime: null,
        timeInterval: null,   
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
        // player won
        var score = tellTime()
        stopClock()
        gGame.isOn = false
        console.log(score)
        return score
    }
}

function fundebug() {
    console.log("gGame.shownCount = " + gGame.shownCount)
    console.log("gGame.markedCount = " + gGame.markedCount)
}

function updateLifeSign() {
    if (gGame.life) {
        gGame.lifeSign.innerText = gGame.life
    }
    else gGame.lifeSign.innerText = ''
}

function loosing() {
    gGame.markedCount++
    gGame.life--
    updateLifeSign()
    if (gGame.life  > 0) return
    stopClock()
    openAll()
    gGame.isOn = false
}

function stopClock() {
    clearInterval(gGame.timeInterval)
}

function OnRestart()
    {
        console.log("restert")
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

