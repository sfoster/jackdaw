define(['../lib/entity'], function (Entity) {

  var componentsDirectory;

  function getComponentPathsFromEntity(entity) {
    var i, componentPaths = [];
    for (i = 0; i < entity.components.length; i += 1) {
      componentPaths.push(entity.components[i]);
    }
    return componentPaths;
  }

  function getComponentPathsFromEntities(entities) {
    var i,
      entitiesComponentPaths = [],
      componentPaths = [];
    for (i = 0; i < entities.length; i += 1) {
      entitiesComponentPaths = getComponentPathsFromEntity(entities[i]);
      componentPaths = componentPaths.concat(entitiesComponentPaths);
    }
    return componentPaths;
  }

  function prependStrings(strings, stringToPrepend) {
    var i;
    for (i = 0; i < strings.length; i += 1) {
      strings[i] = stringToPrepend + strings[i];
    }
    return strings;
  }

  // components must be loaded before entities can use them
  function loadComponents(levelData, callback) {
    var componentPaths = getComponentPathsFromEntities(levelData.entities);
    // add the components directory to the components path
    componentPaths = prependStrings(componentPaths, componentsDirectory);
    require(componentPaths).then(
      function success() {
        // the components were loaded successfully
        callback();
      },
      function failure(ex) {
        callback(ex);
      }
    );
  }

  function createEntityFromData(entityData) {
    // just a pass through at this point. 
    return new Entity(entityData);
  }

  function createEntities(levelData) {
    var i, entities = [];
    for (i = 0; i < levelData.entities.length; i += 1) {
      entities.push(createEntityFromData(levelData.entities[i]));
    }
    return entities;
  }

  function createEntitiesFromData(levelData, callback) {
    loadComponents(levelData, function (error) {
      callback(error, createEntities(levelData));
    });
  }

  return {
    createEntities: function (options, callback) {
      if (!options.levelData || !options.componentsDirectory) {
        throw new Error("entityLoader requires levelData and componentsDirectory");
      }
      componentsDirectory = options.componentsDirectory;
      createEntitiesFromData(options.levelData, callback);
    }
  };
});
