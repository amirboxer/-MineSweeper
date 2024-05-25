'use strict'
const MINE = '💣'
const FLAG = '⛳'
const EMPTY = ''
const LEVELS = {Beginner: {size: 4, numOfMines: 2}, 
               Medium: {size: 8, numOfMines: 14}, 
               Expert: {size: 12, numOfMines: 32}}
const UNDO = 'undo'
const UNSHOW = 'UNSHOW'
const UNMARK = 'UNMARK'

var gBoard = []
var gLevel = LEVELS.Medium
var gUndoLine = []


function createUndoElement(){
    return {
        increaseLife: false,
        cellsToUndo: []
    }
}

function printBaord() {
    var out = []
    for (var i = 0; i < gBoard.length; ++i) {
        var row = []
        for (var j = 0; j < gBoard.length; ++j) {
            if (gBoard[i][j].isMine) {
                row.push(MINE)
            } else {
                row.push(`${gBoard[i][j].minesAroundCount}`)
            }
        }
        out.push(row)
    }
    console.table(out)
}

function createBoard(level, firstClickBlock=[{i :0, j: 0}]) {
    gBoard = []
    createBoardWithoutMines(level.size)
    insertMines(firstClickBlock,  level.size, level.numOfMines)
}

function createBoardWithoutMines(size) { 
    for (var i = 0; i < size; ++ i){
        gBoard.push([])
        for (var j = 0; j < size; ++j) {
            gBoard[i].push({
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false})
        }
    }
}

function insertMines(noMineSpots, size, numOfMines) {
    var minesLocations = getSpotsForMines(noMineSpots, size, numOfMines)
    for (var m = 0; m < minesLocations.length; m++) {
        var i = minesLocations[m].i
        var j = minesLocations[m].j
        gBoard[i][j].isMine = true
        setMinesNegsCount(minesLocations[m], size)
    }
}

function getSpotsForMines(noMineSpots, size, numOfMines) {
    var emptySpots = getArrOfRange(size * size)
    for (var k = 0; k < noMineSpots.length; ++k) {
        var noMineSpotIndexes = noMineSpots[k].i * size + noMineSpots[k].j
        emptySpots.splice(emptySpots.indexOf(noMineSpotIndexes), 1)
    }


    var out = []
    for (var i = 0; i < numOfMines; ++i) {
        var randIndex = getRandInt(0, emptySpots.length)
        var spot = emptySpots.splice(emptySpots.indexOf(randIndex), 1)[0]
        out.push({i : Math.floor(spot / size), j : spot % size})
    }
    return out
}

function getNeighbors(location, size) {
    var out = []
	var min_i = Math.max(location.i - 1, 0)
	var max_i = Math.min(location.i + 1, size - 1)
	var min_j = Math.max(location.j - 1, 0)
	var max_j = Math.min(location.j + 1, size - 1)
    for (var i = min_i; i <= max_i; ++i) {
        for (var j = min_j; j <= max_j; ++j)
			{
                if (i === location.i && j === location.j) continue
                out.push({i: i, j: j})
			}
		}    
    return out
}

function setMinesNegsCount(location, size) {
    var neighborsLocs = getNeighbors(location, size)
    for (var n = 0; n < neighborsLocs.length; ++n) {
        gBoard[neighborsLocs[n].i][neighborsLocs[n].j].minesAroundCount += 1
    }
}

function rederBoard(size) {
    var table = document.querySelector('tbody')
    table.innerHTML = ''
    for (var i = 0; i < size; ++i) {
        var row = '<tr>'
        for (var j = 0; j < size; ++j)                 
            row += `<td><div class="center">
                    <div class="outer button">
                    <button id="${getIdStr(i,j)}" onclick="onFirstClick(id)" oncontextmenu="onRightClick(event, this)"></button>
                    <span></span>
                    <span></span>
                    </div>`
        row += '</tr>'
        table.innerHTML += row
    }
}

function getIdStr(i,j) {
    return `i_${i}-j_${j}`
}

function idToNums(id) {
    var id = id.replace(/[ij_]/g, '').split('-')
    return {i: +id[0], j: +id[1]}
}

function onFirstClick(id) {
    gGame.isOn = true
    gUndoLine = []
    gGame.startTime = new Date()
    gGame.timeInterval = setInterval(tellTime, 1000)   
    updateLifeSign()
    updateMinesOnBoardSign()
    var firstClicklocation = idToNums(id)
    var NoMinesBlock = getNeighbors(firstClicklocation, gGame.level.size)
    NoMinesBlock.push(firstClicklocation)
    createBoard(gGame.level, NoMinesBlock)
    replaceOnClickFunction()
    gUndoLine.push(createUndoElement())
    openUp(firstClicklocation)
    printBaord()
}

function getCellDomByIndex(i, j) {
    return document.querySelector('#' + getIdStr(i, j))
}

function replaceOnClickFunction() {
    for (var i = 0; i < gBoard.length; ++i) {
        for (var j = 0; j < gBoard.length; ++j) {
            const elCell = getCellDomByIndex(i, j)
            elCell.setAttribute('onclick', 'onCellClick(id)')
        }
    }
}

// AKA full expand
function openUp(location) {
    var i = location.i   
    var j = location.j
    if (gBoard[i][j].isMine || gBoard[i][j].isShown || gBoard[i][j].isMarked) return
    showCell(location)
    var undoEl = gUndoLine[gUndoLine.length - 1]
    undoEl.cellsToUndo.push({location: location, actionNeeded: UNSHOW})
    if (gBoard[i][j].minesAroundCount === 0) { 
        var neighbors = getNeighbors(location, gBoard.length)
        for (var k = 0; k < neighbors.length; ++k) {
        setTimeout(openUp, 25, neighbors[k])
        }
    }
}

function undoMove(){
    var undoTurn = gUndoLine.pop() 
    if (!undoTurn) return
    if (undoTurn.increaseLife) {
        gGame.life++
        updateLifeSign()
    }
    for (var i = 0; i < undoTurn.cellsToUndo.length; ++i) {
        var cellLoc = undoTurn.cellsToUndo[i].location
        var act = undoTurn.cellsToUndo[i].actionNeeded
        switch(act) {
            case UNSHOW:
                unshow(cellLoc)
                break;
            case UNMARK:
                onRightClick(null, getCellDomByIndex(cellLoc.i, cellLoc.j), false)
                break;
            }
    }
}

function onCellClick(id) {
    if (!gGame.isOn) return

    // check if undo was clicked
    if (id === UNDO) {  
        undoMove()
        return
    }

    // add turn to previous turns to keep track for undo 
    gUndoLine.push(createUndoElement())
    var undoEl = gUndoLine[gUndoLine.length - 1]

    // start check what cell was hit here
    var location = idToNums(id)
    var cell = gBoard[location.i][location.j]

    // marked cell no reaction
    if(cell.isMarked) return

    // mine was clicked
    if (cell.isMine) {
        showCell(location)
        cell.isMarked = true  

        // keep track for undo operation
        undoEl.increaseLife = true
        undoEl.cellsToUndo.push({location: location, actionNeeded: UNSHOW})

        //check if lost or won
        loosing()
        winning()
        return
    }

    // an open cell was clicked
    if (cell.isShown) { 
        var neighbors = getNeighbors(location, gBoard.length)
        var notMarkedAround = countNotMarkedNeighbors(neighbors)
        if (notMarkedAround.length === neighbors.length - cell.minesAroundCount) {
            for (var k = 0; k < notMarkedAround.length; ++k) {
                var neighbor = gBoard[notMarkedAround[k].i][notMarkedAround[k].j]

                // user marked a regular cell as a mine and tried to open a mine
                if (neighbor.isMine) {
                    showCell(notMarkedAround[k])
                    gBoard[notMarkedAround[k].i][notMarkedAround[k].j].isMarked = true

                    // keep track for undo operation
                    undoEl.increaseLife = true
                    undoEl.cellsToUndo.push({location: location, actionNeeded: UNSHOW})

                    //check if lost or won
                    loosing()
                    winning()
                    return
                }   
            }

            // user correctly marked all the mines around the cell
            for (var k = 0; k < notMarkedAround.length; ++k) {
                var neighbor = gBoard[notMarkedAround[k].i][notMarkedAround[k].j]
                if (!neighbor.isMarked) {
                    openUp(notMarkedAround[k])
                    winning()
                }   
            }
        }
        return
    }
    // user clicked a non-mine cell
    openUp(location)
    winning()
}

function countNotMarkedNeighbors(neighbors) {
    var out = []
    for (var k = 0; k < neighbors.length; ++k)
        {
            if (!gBoard[neighbors[k].i][neighbors[k].j].isMarked) {
                out.push(neighbors[k])
            }
        }
    return out
}

function openAll() {
    var time = 1
    for (var i = 0; i < gBoard.length; ++i) {
        for (var j = 0; j < gBoard.length; ++j)
            {
                if (!gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
                    setTimeout(showCell, 8 * time,{i: i, j: j})
                    time++
                }
            }
    }
}

function onRightClick(e, elCell, trackForUndo=true) {
    if (e) e.preventDefault()
    if (!gGame.isOn) return
    var location = idToNums(elCell.id)
    if (gBoard[location.i][location.j].isShown) return
    if (gBoard[location.i][location.j].isMarked){
        gBoard[location.i][location.j].isMarked = false
        UnRenderFlag(elCell)
        gGame.markedCount--                             
    } else {
        gBoard[location.i][location.j].isMarked = true  
        renderFlag(elCell)
        gGame.markedCount++
    }
    if (trackForUndo){
        gUndoLine.push(createUndoElement())
        var undoEl = gUndoLine[gUndoLine.length - 1]
        undoEl.cellsToUndo.push({location: location, actionNeeded: UNMARK})                                   
    }   
    updateMinesOnBoardSign()   
    winning()
}

function renderFlag(elCell) {
    elCell.innerHTML = '<img class="flag" src="imgs/flag.webp" alt="⛳"></img>'
    var bottun = elCell.closest('.outer button')
}

function UnRenderFlag(elCell) {
    elCell.innerHTML = EMPTY
}

function showCell(location) {
    var i = location.i
    var j = location.j
    if (gBoard[i][j].isShown) return
    gBoard[i][j].isShown = true
    var elCell = getCellDomByIndex(i, j)
    uncoverCellInDom(location) 
    if (gBoard[i][j].isMine) {
        return
    }    
    gGame.shownCount += 1
    gBoard[i][j].isShown = true
}

function unshow(loc) {
    var i = loc.i
    var j = loc.j
    if (!gBoard[i][j].isShown) return
    gBoard[i][j].isShown = false
    gBoard[i][j].isMarked = false
    var elCell = getCellDomByIndex(i, j)
    var elOuter = elCell.closest('.outer')
    elOuter.classList.remove('outerShownBobm', 'outerShown')
    elCell.innerHTML = EMPTY
    if (!gBoard[i][j].isMine) {
        gGame.shownCount -= 1
    }   
}

function uncoverCellInDom(location) {
    var i = location.i
    var j = location.j
    var elCell = getCellDomByIndex(i, j)
    var elOuter = elCell.closest('.outer')
    if (gBoard[i][j].isMine) {
        elCell.innerHTML = '<img class="bomb" src="imgs/bomb.png" alt="💣">'   
        elOuter.classList.add('outerShownBobm')
        return
    }

    elOuter.classList.add('outerShown')
    if (gBoard[i][j].minesAroundCount != 0) {
        elCell.innerHTML = gBoard[i][j].minesAroundCount
    }
}