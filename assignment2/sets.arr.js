define(["js/runtime-util", "trove/pick"], function(util, pickLib) {
  return util.memoModule("sets2", function(runtime, ns) {
    return runtime.loadModules(ns, [pickLib], function(pick) {

      var M = runtime.makeMethodFromFun;
      var ffi = runtime.ffi;
      var get = runtime.getField

      function applyBrand(brand, val) {
        return get(brand, "brand").app(val);
      }
      function hasBrand(brand, val) {
        return get(brand, "test").app(val);
      }

      var brandSet = runtime.namedBrander("set");
      var annSet = runtime.makeBranderAnn(brandSet, "Set");
      var checkSet = runtime.makeCheckType(function(v) { return hasBrand(brandSet, v) }, "Set");

      function notYetImplemented(name) {
        return M(function(_) {
          ffi.throwMessageException("Not yet implemented: " + name);
        });
      }

      function makeSetFromArr(arr) {
        return applyBrand(brandSet, runtime.makeObject({
          member: M(function(self, val) {
            var results = arr.filter(function(v) { return runtime.equal_always(v, val); });
            return results.length > 0;
          }),
          add: notYetImplemented("add"),
          remove: notYetImplemented("remove"), 
          pick: notYetImplemented("pick"),
          count: notYetImplemented("count"), 
          union: M(function(self, other) {
            // This is how you can check arguments for set-ness
            checkSet(other);
            return self;
          }),
          intersection: notYetImplemented("intersection"), 
          difference: notYetImplemented("difference"), 
          "to-list": notYetImplemented("to-list"), 
          fold: notYetImplemented("fold"), 
          _torepr: M(function(self, torepr) {
            return runtime.makeString("(a set)");
          }),
          _equals: notYetImplemented("_equals")
        }));
      }

      return runtime.makeObject({
        "provide-plus-types": runtime.makeObject({
          types: { Set: annSet },
          values: runtime.makeObject({
            'set': runtime.makeObject({
              make: runtime.makeFunction(function(arr) {
                ffi.checkArity(1, arguments, "set");
                runtime.checkArray(arr);
                return makeSetFromArr(arr);
              })
            })
          })
        }),
        "answer": runtime.nothing
      });
    });
  });
});
