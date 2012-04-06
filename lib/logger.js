define(['event'], function(evt){
  console.log("event: ", evt);
  evt.listen("log", function(){
    try{
      if(console && console.log){
        // TODO make game.emit('log' work like console.log
        console.log(arguments[0]);       
      }
    } catch(e){}
  });
  return {
    log: function() {
      evt.emit('log', arguments[0]);
    }
  };
});
