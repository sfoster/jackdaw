define(['lang'], function(lang){

  var rectsToRender = [];
  
  function toRgbExpression(color){
    // create a valid rgb(...) or rgba() string representation of this color
    var values, str;
    values = [Math.round(color.r || 0), Math.round(color.g || 0), Math.round(color.b || 0)];
    str = '';
    if('a' in color && color.a < 1){
      values.push(color.a);
      str = 'rgba('+ values.join(',') + ')';
    } else {
      str = 'rgb('+ values.join(',') + ')';
    }
    return str;
  }
  
  var renderer = {
    name: 'canvasRenderer',
    init: function() {
      var doc = document, 
          id = this.name, 
          node = this.canvasNode;
          count = 0;
      if(!node){
        node = doc.createElement("canvas");
        while(doc.getElementById(id)){
          id = this.name + (count++);
        }
        node.id = id;
        document.body.appendChild( node );
      }
      this.setCanvas( node );
      this._dirtyBox = null;
    },

    setCanvas: function(canvas) {
      this.canvasNode = canvas;
      this.ctx = canvas.getContext('2d');
      console.log(this.ctx, this.canvasNode);
    },
    _renderImage: function(ctx, obj){
      // simple image rendering
      var img = obj.img;

      ctx.drawImage.apply(ctx, [img, 0, 0]);
    },
    _renderSprite: function(ctx, obj){
      // sprite rendering
      var sprite = obj.sprite, 
          animFrame = obj.spriteFrameIdx, 
          img = sprite.img;

      ctx.drawImage(    
          img,                                            // image
          sprite.offsetx + (animFrame * sprite.width),    // source-x
          sprite.offsety,                                 // source-y
          sprite.width,                                   // source-width
          sprite.height,                                  // source-height
          obj.x,                                          // dest-x
          obj.y,                                          // dest-y
          obj.width,                                      // dest-width
          obj.height                                      // dest-height
      );
    },
    _renderText: function(ctx, obj){
      // text/label rendering
      var oldFont, fillStyle;
      if(obj.font && obj.font !== ctx.font){
        oldFont = ctx.font;
        ctx.font = obj.font;
      }
      if(obj.color){
        fillStyle = typeof obj.color == "string" ? obj.color : obj.rgbstyle || (obj.rgbstyle = toRgbExpression(obj.color));
        if(ctx.fillStyle !== fillStyle) ctx.fillStyle = fillStyle;
      }
      ctx.fillText( obj.text, obj.x, obj.y );
      if(oldFont) ctx.font = oldFont;
    },
    _renderShape: function(ctx, obj) {
      // color fill rendering
      var fillStyle;
      if(obj.color){
        fillStyle = typeof obj.color == "string" ? obj.color : obj.rgbstyle || (obj.rgbstyle = toRgbExpression(obj.color));
        if(ctx.fillStyle !== fillStyle) ctx.fillStyle = fillStyle;
      }
      if(obj.shape == 'rect') {
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      } else {
         throw("unsupported shape: "+ obj.shape);
      }
    },
    _renderLine: function(ctx, obj){
      // line/polygon rendering
      console.log("line rendering not implemented yet");
    },
    
    render: function(objects) {
      if(!(objects instanceof Array)) {
        throw "canvasRenderer.render expects array of renderable objects";
      }

      // simple renderer to draw a list of objects to a canvas, no camera, no projector
      var ctx = this.ctx, // projector.projectScene(scene, camera)? 
          obj = null;

      if(!this.ctx){
        return;
      }
      this.clear();
      for(var i = 0, len=objects.length; i<len; i++){
        obj = objects[i];
        if(obj.sprite) {
          this._renderSprite(ctx, obj);
        } else if(obj.img){
          this._renderImage(ctx, obj);
        }
        if(obj.shape){
          this._renderShape(ctx, obj);
        }
        if(obj.line){
          this._renderLine(ctx, obj);
        }
        if(obj.text){
          this._renderText(ctx, obj);
        }
      }
    },
    setSize: function(w,h) {
      this.canvasNode.width = w; 
      this.canvasNode.height = h;
    },
    clear: function(box){
      var ctx = this.ctx, 
          node = this.canvasNode,
          bounds = lang.createObject({
            x: 0,
            y: 0, 
            w: node.width, 
            h: node.height
          }, box || {});
      if(ctx) {
        ctx.clearRect( bounds.x, bounds.y, bounds.w, bounds.h );
      }
    }
  };
  
  return renderer; 
});
