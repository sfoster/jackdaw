define([
  'component'
], function(Component){ 

  return Component.create({
    name: "ricochet",
    attach: function (ent) {
      if(!ent.movement){
        ent.movement = {};
      }
    },
    update: function(ent){
      var bounds = ent.bounds || ent.parent.bounds,
          movement = ent.movement,
          xdir = movement.xdir, 
          ydir = movement.ydir;
      if(!bounds) throw "Missing bounds property of entity:" + ent.id;
      var x = ent.x, y = ent.y;
      if(x < 0 || x + ent.width > bounds.r) { 
        xdir *= -1;
        movement.xdir = xdir;
      }
      if(y < 0 || y + ent.height > bounds.b) { 
        ydir *= -1;
        movement.ydir = ydir;
      }
      x += (10 * xdir);
      y += (5 * ydir);
      ent.x = x; 
      ent.y = y;
    },
    detach: function (ent) {
      
    }
  });

});
