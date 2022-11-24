import {Injectable} from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private tilesToPlace: Array<Object> | undefined = [];

  constructor(
    private apiService: ApiService
  ) {
  }

  initTilesToPlace = async () => this.tilesToPlace = await this.apiService.getTilesList();

  getTile = () => {
    const rtrn = this.getRandomTileToPlace();
    this.clearTilesToPlace(rtrn.id);
    return rtrn.tile;
  };

  getRandomTileToPlace = () => {
    //takes the first letter of tilesToPlace, chooses a random tile from the list of tiles with this letter and returns it
    // @ts-ignore
    const id = Math.floor(Math.random() * this.tilesToPlace[0].data.length);
    // @ts-ignore
    return {tile: this.tilesToPlace[0].data[id], id};
  };

  clearTilesToPlace = (id: number) => {
    // @ts-ignore
    this.tilesToPlace[0].data.splice(id, 1);
    // @ts-ignore
    if (!this.tilesToPlace[0].data.length) {
      // @ts-ignore
      this.tilesToPlace.splice(0, 1);
    }
  };
}
