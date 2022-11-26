import {Injectable} from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private tilesToPlace;

  constructor(
    private apiService: ApiService
  ) {}

  //api request to get tiles list
  initTilesToPlace = async () => this.tilesToPlace = await this.apiService.getTilesList();

  //chooses a tile at random in the current letter, then delete it from tilesToPlace
  getTile = () => {
    const rtrn = this.getRandomTileToPlace();
    this.clearTilesToPlace(rtrn.id);
    return rtrn.tile;
  };

  //takes the first letter of tilesToPlace, chooses a random tile from the list of tiles with this letter and returns it
  getRandomTileToPlace = () => {
    const id = Math.floor(Math.random() * this.tilesToPlace[0].data.length);
    return {tile: this.tilesToPlace[0].data[id], id};
  };

  //splices the tilesToPlace[0][id], and tilesToPlace[0] if it's empty
  clearTilesToPlace = (id) => {
    Object(this.tilesToPlace[0]).data.splice(id, 1);
    if (!Object(this.tilesToPlace[0]).data.length) {
      this.tilesToPlace.splice(0, 1);
    }
  };
}
