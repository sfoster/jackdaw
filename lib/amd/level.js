define(['dollar', 'lang', 'json/ref', 'event', 'entity', 'component', 'sprite'], function($, lang, json, event, Entity, Component, Sprite){

  function get(url, callback){
    console.log("get url: ", url);
    $.ajax({
      url: url,
      dataType: 'json',
      success: callback,
      error: function(err){
        console.error("Error loading " + url, err);
      }
    });
  }
  
  function ResourceQueue(){
    this._ids = {}; 
    this.pendingCount = 0;
  }
  ResourceQueue.create = function(args){
    return new ResourceQueue(args);
  };
  
  lang.mixin(ResourceQueue.prototype, event.Evented);
  
  ResourceQueue.prototype.add = function(resourceId, obj, pname){
    var self = this, 
        pairs = this._ids[resourceId];
    if(pairs) {
      pairs.push(obj, pname);
    } else {
      pairs = this._ids[resourceId] = [obj, pname]; // strided list of obj, name pairs
      this.pendingCount++;
      require([resourceId], function(res){
        self.pendingCount--;
        var obj, pname; 
        while((obj=pairs.shift()) && (pname=pairs.shift())){
          obj[pname] = res;
        }
        self.emit('load', { resource: res, id: resourceId, pending: self.pendingCount });
      });
    }
  };
  
  function _createSpriteFromData(data, level){
    console.log("create sprite from: ", data);
    // apply any delegates to the state data
    data.state = lang.map(data.state || {}, function(state, name){
      if(name.indexOf('__') === 0) return lang.map.undef;
      var proto = state.$delegate;
      if(proto) {
        delete state.$delegate;
        state = lang.createObject(proto, state);
      }
      if(typeof state.img == 'string'){
        level.resourceLoader.add('image!'+state.img, state, 'img');
      }
      return state;
    });
    
    var sprite = Sprite.create(data);
    console.log("created sprite: ", sprite);
    return sprite;
  }
  function _createEntityFromData(data, level){
    // apply any delegates to the state data
    var proto = data.$delegate;
    if(proto) {
      delete state.$delegate;
      data = lang.createObject(proto, data);
    }
    
    var ent = Entity.create(data);
    ent.toJSON = function(){
      return json.toJson(this, true);
    };
    console.log("created entity: ", ent);
    return ent;
  }
  
  function walkLevelData(data) {
    var resourceLoader = ResourceQueue.create(), 
        level = json.resolveJson(data ), 
        i;
    level.resourceLoader = resourceLoader;
    // create sprites
    if(level.sprites){
      for(i=0; i<level.sprites.length; i++) {
        level.sprites[i] = _createSpriteFromData( level.sprites[i], level );
      }
    }
    // create components
    // create entities
    if(level.entities){
      for(i=0; i<level.entities.length; i++) {
        level.entities[i] = _createEntityFromData( level.entities[i], level );
      }
    }
    return data;
  }
  //API
  return {
    load : function(name, req, onLoad, config) {
      if(config.isBuild){
        onLoad(null); //we want to load the resource at runtime, not inline during build
      }else{
        get(req.toUrl(name), function(data){
          var level = walkLevelData( data );
          onLoad( level );
        });
      }
    }
  };
  
});