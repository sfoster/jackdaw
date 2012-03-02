define(['lang', 'component'], function(lang, Component){ 

  var keysDown = {}, 
      keysDownMask= 0x0,
      // create a map of raw keyCode ints to nicer names we can use throughout
      keyCodeMapping = {
        37: 'LEFT',
        38: 'UP',
        39: 'RIGHT',
        40: 'DOWN'
        // 
      },
      unlistenHandles = {},
      listenersAttached = false, 
      // create a map of direction names to bit values for nifty bitwise tests and manipulation
      KEYBITS = {
        UP: 0x1,
        RIGHT: 0x2, 
        DOWN: 0x4, 
        LEFT: 0x8
      }; 
      // 0001 <= UP
      // 0010 <= RIGHT
      // 0011 <= RIGHT and UP
      // 0111 <= RIGHT and UP and DOWN
      // 1111 <= RIGHT and UP and DOWN and LEFT

  // TODO: support config for wasd key mapping?
  function onKeyDown(e) {
    var keyName = keyCodeMapping[e.keyCode] || String.fromCharCode(e.keyCode).toUpperCase();
    keysDown[keyName] = true;
    if(keyName in KEYBITS){
      // OR together the bit value for this key with other keys also currently down
      // to create a bitmask of keys pressed
      keysDownMask |= KEYBITS[keyName]; 
    }
  }

  function onKeyUp(e){
    var keyName = keyCodeMapping[e.keyCode] || String.fromCharCode(e.keyCode).toUpperCase();
    delete keysDown[keyName];
    if(keyName in KEYBITS){
      // update the bit mask to remove the value corresponding to this key
      keysDownMask &= ~(KEYBITS[keyName]);
    }
  }

  function setupListeners(){
    unlistenHandles.keydown = function(){
      document.removeEventListener('keydown', onKeyDown, false);
    };
    unlistenHandles.keyup = function(){
      document.removeEventListener('keyup', onKeyUp, false);
    };
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    return unlistenHandles;
  }
  
  var keyboardControl = new Component({ 
    name: 'keyboardControls',
    attach: function(ent){
      // give the entity a map like {KEYNAME: true}
      ent.keysDown = Object.create(keysDown); // use Object.create to make a shallow copy (backed by the module's object as prototype)
      ent.keysDownMask = 0x0;
      if(!listenersAttached){
        setupListeners();
        listenersAttached = true;
      }
    },
    detach: function(ent){
      var name;
      for(name in unlistenHandles){
        unlistenHandles[name]();
      }
      unlistenHandles = {};
      listenersAttached  = false;
      delete ent.keysDown;
      delete ent.keysDownMask;
      delete ent.keyDirection;
    },
    update: function(ent){
      var hasKeys = false, 
          entityKeys = ent.keysDown = {};
      for(var i in keysDown){
        entityKeys[i] = keysDown[i];
        hasKeys = true;
      }
      ent.keysDownMask = keysDownMask;
      var dir = false;
      
      switch(keysDownMask){
        case 0:   break; // no keys
        case 1:   break; // up keys
        case 2:   break; // right only key
        case 3:   break; // up and right keys
        case 4:   break; // down only key
        case 5:   break; // down and up key
        case 6:   break; // right and down key
        case 7:   break; // right and down and up key
        case 8:   break; // left only key
        case 9:   break; // left and up keys
        case 10:  break; // left and right keys
        case 11:  break; // left and up and right keys
        case 12:  break; // left and down keys
        case 13:  break; // left and down and up keys
        case 14:  break; // left and right and down keys
        case 15:  break; // left and right and down and up keys
      }
      if(hasKeys){
        dir = 0;
        if(keysDown.DOWN)  dir = 180; 
        if(keysDown.UP)    dir = 360; 
        if(keysDown.LEFT)  dir = dir ? 270 + (360-dir?-45:45) : 270;
        if(keysDown.RIGHT) dir = dir ? 90 + (360-dir?-45:45) : 90; 

        if(dir < 0) dir = 360+dir;
        ent.keyDirection = dir;
      } else {
        delete ent.keyDirection;
      }
    }
  });
  return keyboardControl;
});
