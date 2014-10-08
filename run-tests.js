"use strict";

var assert = require("assert");
var runtime = require("./runtime.js");
var fs = require("fs");

var specs = [
  {
    name: "number.arr",
    val: function(val) {
      assert.equal(val, 5);
    }
  },
  {
    name: "addition.arr",
    val: function(val) {
      assert.equal(val, 10);
    }
  },
  {
    name: "data.arr",
    val: function(val) {
      assert.equal(val, 1);
    }
  },
  {
    name: "cases.arr",
    val: function(val) {
      assert.equal(val, "empty");
    }
  },
  {
    name: "subtract.arr",
    val: function(val) {
      assert.equal(val, 5);
    }
  },
  {
    name: "bad-subtract.arr",
    exn: function(e) {
      assert.equal(e.type, "type-mismatch");
    }
  }
];


describe("Compiler", function() {
  var specDict = {};
  specs.forEach(function(s) {
    specDict[s.name] = s;
  });
  fs.readdirSync("tests/").forEach(function(path) {
    if(path.slice(path.length - 4) !== ".arr") { return; }
    var s = specDict[path];
    if(typeof s === "undefined") {
      it(path, function() {
        throw new Error("No test spec specified for test file " + path);
      });
      return;
    }
    it(s.name, function() {
      var evalFun = eval;
      var thisRuntime = runtime.makeRuntime();
      var compiled = evalFun("(" + String(fs.readFileSync("tests/" + s.name + ".js")) + ")");
      var answer;
      try {
        answer = compiled(thisRuntime.helpers);
      } catch(e) {
        if(!s.exn) {
          throw {
            message: "expected value, got exn: " + JSON.stringify(e),
            exn: e,
            test: s.name
          }
        }
        s.exn(e);
        return;
      }
      if(!s.val) {
        throw {
          message: "expected exn, got value: " + JSON.stringify(value),
          value: answer,
          test: s.name
        }
      }
      s.val(answer);
    });
  });
});

