function distance (p1, p2) {
  try {
    const x = p1[0] - p2[0]
    const y = p1[1] - p2[1]
    const z = p1[2] - p2[2]
    return Math.sqrt(x * x + y * y + z * z)
  } catch (e) {
    return 0
  }
}

module.exports = distance
