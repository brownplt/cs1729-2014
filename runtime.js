function makeRuntime() {
  function typeMismatch(expectedType, value) {
    return {
      type: "type-mismatch",
      expectedType: expectedType,
      value: value
    };
  }

  function checkNumber(arg) {
    if(typeof arg !== "number") {
      throw typeMismatch("Number", arg);
    }
  }

  function subtract(arg1, arg2) {
    checkNumber(arg1);
    checkNumber(arg2);
    return arg1 - arg2;
  }

  return {
    helpers: {
      subtract: subtract
    }
  }
}

exports.makeRuntime = makeRuntime;

