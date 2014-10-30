# Assignment 2

Your second assignment is to implement a Pyret datatype for sets, in
JavaScript, using the interface to runtime values.  The main goal is to learn
what it's like to work with the "underneath" parts of a language
implementation.  You defined some of this on your own in the last assignment to
make e.g. datatypes work.  This assignment uses the real Pyret API to do the
build up a datatype.

Because the code review and fix-up worked well for the last assignment, I'd
like to have two deadlines: one next Thursday (Nov 6), and another the
following Tuesday again (Nov 11), so we can do review and then do fixes.  This
still leaves a month for projects, so the timing will work out well.


## Supported operations

Your implementation should support all the methods listed in the "set methods"
section here:

http://www.pyret.org/docs/latest/sets.html

The operations must satisfy the following complexities:

```
pick, count:
  constant-time

member, add, remove, to-list, fold:
  O(n) where n is the size of the set

union, intersection, difference:
  O(n^2) where n is the size of the set
```

These are very generous time bounds; the focus is mainly on getting you to use
the runtime interface to Pyret.

Your sets should distinguish elements by equal-always (see
http://www.pyret.org/docs/latest/equality.html for descriptions of the
different equalities), so if two equal-always elements are passed in, the set
should not grow.

Your set implementation should be _persistent_: you should not mutate the
existing set on add and remove, but should return a new set with all the old
elements and the new one, leaving the old set unaffected.

## torepr and equals

You must also implement two methods that interact with the internals of Pyret:
_torepr and _equals.  You can read about what _equals does at
http://www.pyret.org/docs/latest/equality.html (the very end).  The _torepr
method is used for generating REPL output for the value.

Your _torepr function should produce output that looks like:

```
[set: val1, val2, val3, ...]
```

Where val1, val1, etc are the `torepr` versions of the values.  The signature
of the _torepr function you should implement is:

```
._torepr :: (torepr-rec :: (Any -> String)) -> String
```

The function passed as an argument should be used to recursively torepr any
contents, in order to handle cyclic values correctly.  This will matter when
you are converting the elements of the set to strings, and you will need to use
the `torepr` argument in the stencil code.

## Mechanics

Your tests go in set-tests.arr, and your code goes in sets.arr.js.  The
template has a bunch of not-yet-implemented method stubs, and your job is to
fill them all in.  The only command you really need is `make test`.

One annoying thing is that the combination of node and Pyret's module systems
doesn't really tell you what's going on if there is a _JavaScript_ syntax error
in a file.  So if you see a message like `couldn't load module sets.arr`, try
running just:

```
$ node sets.arr.js
```

And see if there is a syntax error.  If it says just "define is not defined",
that means you're all set (that's just complaining because it's a module, not a
standalone file).  But if it says anything else, it's probably a syntax error
in the JS.

## Interfaces to Use

The interfaces below are _JavaScript_ interfaces

```
runtime
  .checkNumber
  .checkString
  .checkBoolean
  .checkObject
  .checkFunction
  .checkMethod
  .checkArray

    All of these are single-argument functions that check whether the
    argument is an instance of the corresponding runtime type.

    Example:

      runtime.checkNumber("not-a-num") // raises an exception
      runtime.checkString("not-a-num") // succeeds

  .equal_always 

    Takes two arguments and checks whether they are equal as a boolean.
    Throws an error if comparison would require comparing functions or
    methods.

    Example:

      runtime.equal_always("a", 5) // returns JS true

  .makeString
  .makeNumber

    Take JS strings/numbers and create Pyret versions (these happen to be the
    identity in the current representation)

  .pyretTrue
  .pyretFalse

    The Pyret values for true and false

  .nothing

    A special null-like value

  .makeObject

    Takes a JavaScript object and creates a Pyret object with the same fields
    and values.  Note that a JS object is _not_ a Pyret object, there's extra
    wrapping, etc, that goes into it.

  .makeFunction

    Takes a JS function and creates a Pyret function

  .makeMethodFromFun

    Takes a JS function (of at least one argument) and creates a Pyret method

  .getField

    Takes a Pyret object and a string, and returns the field on the Pyret
    object.


  .ffi
      
    Holds several other utilities:

    .makeList

        Takes a JavaScript array and creates a list

pick

  This is the Pyret 'pick' module (http://www.pyret.org/docs/latest/pick.html).

  You can use getField on it to access fields, e.g.

    pick.getField("pick-some")

  is the constructor for the some case of the pick datatype (you'll need this
  to implement the pick method).


To call a Pyret function, use

  <some-pyret-function>.app(arg1, arg2, ...)

For example:

  pick.getField("pick-some").app(arg1, arg2)

will construct a new Pick.
```

