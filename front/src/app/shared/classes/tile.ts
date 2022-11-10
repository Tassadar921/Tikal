export class Tile {

  private x;
  private y;
  private children = [];
  private hexagon;
  private id;

  constructor(hexagon){
    this.id = hexagon.id;
    this.x = hexagon.position.x;
    this.y = hexagon.position.y;
    this.hexagon = hexagon;
  }

  getX = () => this.x;
  getY = () => this.y;
  getChildren = () => this.children;
  getHexagon = () => this.hexagon;
  getID = () => this.id;
}
