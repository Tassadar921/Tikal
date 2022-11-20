module.exports.getTilesList = function (res) {
    const tiles = require('../files/json/tiles/tiles.json');
    res.send(tiles);
}