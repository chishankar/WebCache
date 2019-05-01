const fs = require('fs');
// TODO: save array of N-bit integers as array of 8-bit integers
module.exports = {};

// #############################################################################
/**
   Synchronously write an array of 32-bit integers at the specified location.
   @param {string} filePath - the specified location on disk
   @param {Uint32Array} uint32arr - the array of 32-bit integers
  */
function writeUint32ArrFileSync(filePath, uint32arr) {
    fs.writeFileSync(filePath, new Buffer(uint32arr.buffer));
}
module.exports['writeUint32ArrFileSync'] = writeUint32ArrFileSync;

/**
   Read a file at the specified location as an array of 32-bit integers.
   @param {string} filePath - the specified location on disk
   @return Uint32Array
  */
function readUint32ArrFileSync(filePath) {
    // read out an array of 32-bit integers at the path
    return new Uint32Array((new Uint8Array(fs.readFileSync(filePath))).buffer);
}
module.exports['readUint32ArrFileSync'] = readUint32ArrFileSync;

// #############################################################################

