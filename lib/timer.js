define(function(){
  var slice = Array.prototype.slice; 
  function bind(fn, execContext){
    var partialArgs = slice(arguments, 2);
    return function() {
      var args = partialArgs.concat( slice(arguments, 0) );
      return fn.apply(execContext, args); 
    };
  }
  
  var requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / 60);
            };
  })();
  
  var Loop = function(args){
    args = args || {};
    for(var i in args){
      this[i] = args[i];
    }
    this.lastUpdated = undefined;
  },
  proto = Loop.prototype;
  proto.fps = 1000/60;
  proto.maxDelta = 1000/15;

  proto.start = function(){
    var loop = this;
    this._timer && clearInterval(this._timer);
    this._timer = setInterval(function(){
      var now = +new Date;
      var dt = Math.min(loop.maxDelta, loop.lastUpdated?now-loop.lastUpdated:0);
      loop.lastUpdated = now;
      loop.tick({
        ts: loop.lastUpdated,
        dt: dt
      });
    }, this.fps);
  };
  proto.pause = function(){
    this._timer && clearInterval(this._timer);
  };
  proto.stop = function(){
    this._timer && clearInterval(this._timer);
  };

  var RenderLoop = function(args){
    args = args || {};
    for(var i in args){
      this[i] = args[i];
    }
    this.lastUpdated = undefined;
  };
  RenderLoop.prototype = new Loop;
  RenderLoop.prototype.stop = function(){
    this.isStopped=true;
  };
  RenderLoop.prototype.start = function(){
    this.eachTick = this.eachTick.bind(this);
    this.isStopped = false;
    requestAnimFrame(this.eachTick);
  };
  RenderLoop.prototype.eachTick = function(){
    var now = +new Date;
    var dt = Math.min(this.maxDelta, this.lastUpdated?now-this.lastUpdated:0);
    this.lastUpdated = now;
    this.tick({
      ts: this.lastUpdated,
      dt: dt
    });
    if(!this.isStopped) {
      requestAnimFrame(this.eachTick);
    }
  };

  return {
    RenderLoop: RenderLoop,
    Loop: Loop
  };
});
