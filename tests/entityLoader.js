define([
  '../lib/entity'
], function (Entity) {

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

  // TODO: make this simpler by changing the Entity constructor to receive
  // a single object as its argument (so we can create it straight from
  // the loaded data and dont have to remove the components from the
  // entity data)
  function createEntityFromData(entityData) {
    var components = entityData.components;
    delete entityData.components;
    // an entity requires an array of components as the first argument
    // and an object with any other properties of the entity as the second argument
    return new Entity(components, entityData);
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
    createEntitiesFromLevelPath: function (levelPath, componentsDir, callback) {
      componentsDirectoty = componentsDir;
      require(['level!' + levelPath], function (levelData) {
        createEntitiesFromData(levelData, callback);
      });
    }
  };
});
