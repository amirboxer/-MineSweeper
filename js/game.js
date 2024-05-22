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
        startTime: null,
        timeInterval: null,    // TODO clear interval whem stops 
        clock: document.querySelector('.clock'),
        markMinesSign: document.querySelector('.minesOnBoard')
       }
    gGame.clock.innerText = ''
    updateMinesOnBoardSign()
    rederBoard(gGame.level.size)
}

function tellTime (){
    var endDate   = new Date()
    gGame.clock.innerText = Math.floor((endDate.getTime() - gGame.startTime.getTime()) / 1000)
}

function updateMinesOnBoardSign() {
    gGame.markMinesSign.innerText  = gGame.level.numOfMines - gGame.markedCount
}  

function winning() {
    if (gGame.shownCount === Math.pow(gGame.level.size, 2) - gGame.level.numOfMines) {
        // player won
        var score = tellTime()
        console.log(score)
        stopClock()
        gGame.isOn = falses
    }
}

function loosing() {
    stopClock()
    gGame.isOn = false
}

function stopClock() {
    clearInterval(gGame.timeInterval)
}

function OnRestart()
    {
        if (gGame.timeInterval) clearInterval(gGame.timeInterval)
        onInit()
    }



function levelChoice(){
    var selections = document.querySelectorAll('input')
    for (var i = 0; i < selections.length; i++)
        if (selections[i].checked) {
            return selections[i].value
        }
}