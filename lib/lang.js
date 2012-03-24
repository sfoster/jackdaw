define([], function(){
	// language utilities
	var empty = {};
	
	var mixin = function(targ, obj) {
		for(var i in obj) {
			if(i in empty) continue;
			targ[i] = obj[i];
		}
		return targ;
	}; 
	
	var createObject = function(thing, props) {
		// delegation with mixin. 
		var FN = function(){};
		FN.prototype = thing; 
		var obj = new FN;
		if(props) {
			mixin(obj, props);
		}
		return obj;
	};

  function map(obj, fn, thisArg){
    // suggest you polyfill if you need Javascript < 1.6
    var result = {};
    var eachKeyFn = function(key){
      var res = fn.call(thisArg || null, obj[key], key, obj);
      // *dont* copy back this value if we get back the special undef value
      if(map.undef !== res) result[key] = res;
    };
    if(obj instanceof Array){ 
      obj.forEach(eachKeyFn);
    } else {
      Object.keys(obj).forEach(eachKeyFn);
    }
    return result;
  }
  // arbitrary value we designate as 'undef' or 'please delete me' instruction
  map.undef ='\u0008\u0008';
  
	var after = function(fn, after, scope) {
		// create a function that calls the original then the 'after' function
		return function(){
			var ret = fn.apply(this, arguments);
			after.apply(scope || this, arguments);
			return ret;
		};
	};
	var partial = function(fn){
		// create a function that calls original with the given arguments
		var args = Array.prototype.slice.call(arguments, 1);
		return function(callArgs){
			return fn.apply(this, args.concat(arguments));
		};
	};

	var around = function(fn, before, scope) {
		// create a function that calls the 'before' function, then the original
		return function(){
			before.apply(scope || this, arguments);
			return fn.apply(this, arguments);
		};
	};
	
	var extend = function(clazz, proto){
		mixin(clazz.prototype, proto);
		// mixin the new proto in directly. 
		// TODO: handle property name collisions
		return clazz;
	};
		
	return {
		mixin: mixin, 
		createObject: createObject,
		map: map,
		extend: extend,
		after: after,
		partial: partial
	};
});