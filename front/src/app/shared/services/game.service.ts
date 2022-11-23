import { Injectable } from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private tilesToPlace;

  constructor(
    private apiService: ApiService
  ) {}

  initTilesToPlace = async () => this.tilesToPlace = await this.apiService.getTilesList();

  getTile = () => {
    const rtrn = this.getRandomTileToPlace();
    this.clearTilesToPlace(rtrn.id);
    return rtrn.tile;
  };

  getRandomTileToPlace = () => {
    //takes the first letter of tilesToPlace, chooses a random tile from the list of tiles with this letter and returns it
    const id = Math.floor(Math.random() * this.tilesToPlace[0].data.length);
    return {tile: this.tilesToPlace[0].data[id], id};
  };

  clearTilesToPlace = (id) => {
    this.tilesToPlace[0].data.splice(id, 1);
    if(!this.tilesToPlace[0].data.length){
      this.tilesToPlace.splice(0,1);
    }
  };
}
