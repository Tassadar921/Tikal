export class DraggableTile {

  public children = [];
  public x = 0;
  public y = 0;
  public z = 0;
  public hexagon;
  private id;

  constructor(hexagon){
    this.id = hexagon.id;
    this.x = hexagon.position.x;
    this.y = hexagon.position.y;
    this.hexagon = hexagon;
  }

  dragUpdateChildren = (cooBeforeDrag, difference) => {
    for(const child of this.children){
      child.position.x = cooBeforeDrag.x + difference.x;
      child.position.y = cooBeforeDrag.y + difference.y;
      child.position.z = cooBeforeDrag.z + difference.z;
    }
  };
}
