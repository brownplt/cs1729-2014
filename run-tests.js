"use strict";

var assert = require("assert");
var helpers = require("./helpers.js");
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
  }
];


describe("Compiler", function() {
  specs.forEach(function(s) {
    it(s.name, function() {
      var evalFun = eval;
      var compiled = evalFun("(" + String(fs.readFileSync("tests/" + s.name + ".js")) + ")");
      var answer;
      try {
        var answer = compiled();
      } catch(e) {
        if(!s.exn) {
          throw {
            message: "expected value, got exn: " + String(e),
            exn: e,
            test: s.name
          }
        }
        s.exn(e);
        return;
      }
      if(!s.val) {
        throw {
          message: "expected exn, got value: " + String(value),
          value: answer,
          test: s.name
        }
      }
      s.val(answer);
    });
  });
});

