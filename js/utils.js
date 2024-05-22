'use strict'

function getRandInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
  }


  function getArrOfRange(n) {
    return Array.from(Array(n).keys())
  }

