const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')

const isDirectory = source => lstatSync(source).isDirectory()

exports.getDirectories = function(source){
  return readdirSync(source).map(name => join(source, name)).filter(isDirectory)
}

