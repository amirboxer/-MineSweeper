'use strict'
const MINE = '💣'
const FLAG = '⛳'
const EMPTY = ''
const LEVELS = {Beginner: {size: 4, numOfMines: 2}, 
                Medium: {size: 8, numOfMines: 14}, 
                Expert: {size: 12, numOfMines: 32}}

var gBoard = []
var gLevel = LEVELS.Medium

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
    // TODO   firstClickPos
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
        for (var j = 0; j < size; ++j)                 // todo set function after firtst click
            row += `<td id="${getIdStr(i,j)}" onclick="onFirstClick(id)" oncontextmenu="onRightClick(event, this)"></td>`
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
    gGame.startTime = new Date()
    gGame.timeInterval = setInterval(tellTime, 1000)     
    var firstClicklocation = idToNums(id)
    var NoMinesBlock = getNeighbors(firstClicklocation, gGame.level.size)
    NoMinesBlock.push(firstClicklocation)
    createBoard(gGame.level, NoMinesBlock)
    replaceOnClickFunction()
    openUp(firstClicklocation)
    //printBaord()
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

function openUp(location) {
    var i = location.i
    var j = location.j
    if (gBoard[i][j].isMine || gBoard[i][j].isShown || gBoard[i][j].isMarked) return
    showCell(location)
    if (gBoard[i][j].minesAroundCount === 0) { 
        var neighbors = getNeighbors(location, gBoard.length)
        for (var k = 0; k < neighbors.length; ++k) {
        setTimeout(openUp, 20, neighbors[k])
        }
    }
}


function onCellClick(id) {
    if (!gGame.isOn) return
    var location = idToNums(id)
    var cell = gBoard[location.i][location.j]
    if(cell.isMarked) return
    if (cell.isMine) {
        showCell(location)
        openAll()
        loosing()
        // todo dead !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        return
    }

    if (cell.isShown) {
        var neighbors = getNeighbors(location, gBoard.length)
        var NotMarkedAround = countNotMarkedNeighbors(neighbors)
        if (NotMarkedAround.length === neighbors.length - cell.minesAroundCount) {
            for (var k = 0; k < NotMarkedAround.length; ++k) {
                var neighbor = gBoard[NotMarkedAround[k].i][NotMarkedAround[k].j]
                if (neighbor.isMine) {
                    showCell(NotMarkedAround[k])
                    openAll()
                    loosing()
                    // todo DEAD !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11111
                    return
                }   
            }
            for (var k = 0; k < NotMarkedAround.length; ++k) {
                var neighbor = gBoard[NotMarkedAround[k].i][NotMarkedAround[k].j]
                if (!neighbor.isMarked) {
                    openUp(NotMarkedAround[k])
                    winning()
                }   
            }
        }
        return
    }
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
                    setTimeout(showCell, 15 * time,{i: i, j: j})
                    time++
                }
            }
    }
}


function onRightClick(e, elCell) {
    e.preventDefault()
    if (!gGame.isOn) return
    var location = idToNums(elCell.id)
    if (gBoard[location.i][location.j].isShown) return
    if (gBoard[location.i][location.j].isMarked){
        gBoard[location.i][location.j].isMarked = false
        elCell.innerHTML = EMPTY    //// TODO image mine !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        gGame.markedCount--                              
    } else {
        gBoard[location.i][location.j].isMarked = true
        elCell.innerHTML = FLAG    //// TODO image mine !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        gGame.markedCount++
    }                                   
    updateMinesOnBoardSign()
}

function showCell(location) {
    var i = location.i
    var j = location.j
    if (gBoard[i][j].isShown) return
    gBoard[i][j].isShown = true
    gGame.shownCount += 1
    var elCell = getCellDomByIndex(i, j)
    if (gBoard[i][j].isMine) {
        elCell.innerHTML = MINE   //// TODO image mine !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        return
    }
    if (gBoard[i][j].minesAroundCount != 0) {
        elCell.innerHTML = gBoard[i][j].minesAroundCount

    }
    // todo delete later
    if (gBoard[i][j].minesAroundCount === 0)  elCell.innerHTML = gBoard[i][j].minesAroundCount
}


