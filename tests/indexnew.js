define(['lang', 'engine/core'], function(lang, engine){
  var levelIds = ['example', 'level_002', 'level_003'],// levels are lazy-loaded
    currentLevel = null,
    game = null;
 
  levelIds = ['level_004'];
  
  function enterLevel(level) {
    // the set timeout is so the events from the previous level can finish
    setTimeout(function(){
      validateLevel(level);
      currentLevel = level;
      //can hide the loading screen here
      game.levelStartTime = new Date();
      level.enter();
      game.emit('log', currentLevel.id + ' entered');
      game.loop.start();
    },0);
  }
  function loadLevel(levelId){
    game.emit("log", "loading level with id " + levelId);
    // load the level json data
    require('level!/lib/levels/' + levelId, function(level){
      game.emit('log',"Loaded " + levelId);
      enterLevel(level); 
    });
  }
  game = new engine.Engine({
    // setter for the game's current level
    _setLevelAttr: function(levelId) {
      if(currentLevel){
        currentLevel.exit();
      }
      loadLevel(levelId);
    }
  });
  game.listen("startup", function(){
    if(game.config.startLevel) {
      game.set('level', game.config.startLevel);
    } else {
      game.set('level', levelIds[0]);
    }
  });
  game.listen("update", function(arg){
    if(currentLevel){
      currentLevel.update(arg);
    }
    renderer.renderRects();
    renderer.render();
  });
  return game;
});
