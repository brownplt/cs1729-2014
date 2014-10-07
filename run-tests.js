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
    name: "subtract.arr",
    val: function(val) {
      assert.equal(val, 5);
    }
  }
];


describe("Compiler", function() {
  specs.forEach(function(s) {
    it(s.name, function() {
      var evalFun = eval;
      var thisRuntime = runtime.makeRuntime();
      var compiled = evalFun("(" + String(fs.readFileSync("tests/" + s.name + ".js")) + ")");
      var answer;
      try {
        var answer = compiled(thisRuntime.globals, thisRuntime.helpers);
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

