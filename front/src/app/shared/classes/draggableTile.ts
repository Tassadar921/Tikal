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

  dragStartUpdateChildren = (z) => {
    console.log('dragstart');
    for(const child of this.children){
      child.position.z = z;
      child.userData = {cooBeforeDrag: child.position.clone()};
    }
  };

  dragUpdateChildren = (cooBeforeDrag, difference) => {
    for(const child of this.children){
      console.log(child.userData.cooBeforeDrag);
      child.position.x = child.userData.cooBeforeDrag.x + difference.x;
      child.position.y = child.userData.cooBeforeDrag.y + difference.y;
      child.position.z = child.userData.cooBeforeDrag.z + difference.z;
    }
  };

  dragEnd = () => {
    for(const child of this.children) {
      child.position.z = 15;
      child.userData = {};
    }
  };
}
