/**
 * Get color equivalents
 * @param  {String} color
 */
exports.getColor = function(color: String){
  if (color.toLowerCase() === "red"){
    return '#ffd5d5'
  } else if (color.toLowerCase() === "blue"){
    return '#afcfff'
  } else if (color.toLowerCase() === "green"){
    return '#a3dca2'
  } else if (color.toLowerCase() === "purple"){
    return '#fbcafb'
  } else if (color.toLowerCase() === "yellow"){
    return '#ffffa9'
  }
}

