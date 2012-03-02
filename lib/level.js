define([
  'dollar',
  'lang',
  '../tests/entityLoader'
], function($, lang, entityLoader){

  function Level(entities) {
    console.log("creating level with entities : ",entities);
    this.entities = entities;
  }
  Level.prototype.enter = function(){
    this.entities.forEach(function(ent){
      ent.init && ent.init();
    });
  };
  Level.prototype.update = function(){
    this.entities.forEach(function(ent){
      ent.update();
    });
  };
  Level.prototype.exit = function(){
    var i = 0, 
        entities = this.entities;
    for (i = 0; i < entities.length; i += 1) {
      entities[i].removeComponents();
    }
    delete this.entities;
  };

  return {
    // providing a mechanism for curl to a level from json
    // e.g require('level!' + pathToLevelJson), function(level) {
    load: function (resourceName, req, callback, config) {
      // hook up callbacks
      var cb = callback.resolve || callback,
          eb = callback.reject || error;
      // get the level
      console.log("level loaded!... level creating its self");
      function createLevelWithEntities(callback, levelData) {
        entityLoader.createEntities({
            levelData: levelData,
            componentsDirectory: '../lib/components/'
          }, function (error, entities) {
            if (error) {
              throw error;
            } else {
              callback(new Level(entities));
            }
        });
      }
      $.ajax({
          url: resourceName + '.json', 
          dataType: 'json',
          success: function(levelData) {
            createLevelWithEntities(callback, levelData);
          },
          error: function(err) {
            throw new Error("error loading level: " + resourceName, err);
          }
      });

    }
  };
});
