# Assignment 1

Your task is to compile the subset of the Pyret ast in `compile.arr` to
JavaScript, with help from a JavaScript runtime library that you will build up.
The compiled behavior should be the same as Pyret (with a few exceptions noted
below).  So, if you're not sure what a particular example should do, run it in
Pyret and that's the answer!

There are two AST types you need to know about for this assignment, the Pyret
AST and the JavaScript AST you will be compiling to.  Both are defined within
Pyret, if you need to refer to them, they are at
https://github.com/brownplt/pyret-lang/blob/master/src/arr/trove/ast.arr and
https://github.com/brownplt/pyret-lang/blob/master/src/arr/compiler/js-ast.arr.

You will compile the expression forms below from the Pyret AST to JavaScript
AST expressions.  There are underscores in place of fields that your
compilation doesn't need to deal with.  Each form comes with a few examples to
remind you what the surface syntax does.

## Code Layout

The support code is at https://github.com/brownplt/cs1729-2014.  You can clone
it with

    git clone https://github.com/brownplt/cs1729-2014

Also feel free to fork it to your own Github account if you prefer.

You will edit three files for this assignment:

    compile.arr
    runtime.js
    run-tests.js

### The Compiler

The compiler takes a Pyret expression from the subset below and builds a
JavaScript expression out of it.  There are a few examples in that file for
handling blocks and subtraction as a binary operator.

Note that the subtraction case creates expressions that look like:

    $helpers.subtract(<expr1>, <expr2>)

Whatever expression you generate will be wrapped in the following:

```
function($helpers) {
  return <your-compiled-expression>
}
```

The testing and running infrastructure will ensure that the `$helpers` argument
is the helper functions defined in `runtime.js`, described next.

### The Runtime

It is often useful to consolidate repeated computation or operations over a
representation into library functions (for example, checking the arguments to
"+").  To this end, your compiled output is given access to a *runtime*, which
in this case is a set of helper functions that you can compile calls into.

You can write plain JavaScript code into `runtime.js`, and add functions to the
`helpers` object that is exported from `makeRuntime` to make them available to
compiled code.  The provided `runtime.js` contains an example of checking the
arguments to subtract for being numeric, and raising an error if they aren't.

It will probably be useful to define functions that test types, manipulate
representations of objects and data values, and implement the binary operators
in the runtime.  This will make your compiled code cleaner and more manageable.

### Testing with `run-tests`

Tests are written as ".arr" files in the `tests/` directory.  When you run
`make test`, they are run through your compiler after being run through part of
the Pyret desugarer.  For each ".arr" file, there will be two output files: a
".core" file that shows how Pyret desugared the program before handing it off
to your code, and a ".arr.js" file, which contains the output of your compiler
on the desugared AST.

After compiling all the files, `make test` runs the `run-tests` script.  The
top of this script contains an array of tests that you should add to in order
to test your compiler.  There are two kinds of tests, one for errors and one
for successful runs:

```
  {
    name: "number.arr",
    val: function(v) {
      assert.equal(v, 5);
    }
  }
```

This test runs the compiled output of "number.arr", and passes the result to
the supplied function as `v`.  The testing library is Mocha with Node's assert
module (http://visionmedia.github.io/mocha/,
http://nodejs.org/api/assert.html); you should really only need the
documentation for Node's assert to write your tests.

For tests that should raise errors, you can add a test with an `exn`
callback.  For example, if "bad-subtract.arr" contains `5 - "5"`, we could
test it with:

```
  {
    name: "bad-subtract.arr",
    exn: function(e) {
      assert.equal(e.type, "type-mismatch");
    }
  }
```

## Differences from Pyret

There are a few differences between what you will produce and real Pyret, aside
from only implementing a subset.

### Errors

You do not have to produce the same error messages as Pyret, but you *do* have
to produce meaningful errors.  For each kind of error you need, you should
throw a JavaScript value similar to the example for "type-mismatch" in the
provided `runtime.js`.  If Pyret produces an error, you should as well.

## Bignums

Pyret has exact integer and rational arithmetic.  You do not need to support
this, and can use JavaScript numbers to represent Pyret numbers.

### Annotations

Many of the expressions you will compile have annotation positions in them.
You can ignore all annotations checking in this assignment, so treat arguments
to functions, let-bindings, etc as completely untyped.

## Expressions and Descriptions

```
  s-block(_, exprs)
```

Runs all the exprs and returns the value that the last one returned.

One thing to note is the pattern used in the `s-block` case to compile an
expression-based version of a block.  A Pyret block like the body of this
function:

```
fun f(x):
  when false: "skip" end
  x + 1
end
```

Evaluates to the value of the last expression in the block.  If we simply
converted each expression to JavaScript and put it in a block, we'd get
something like (this is probably much simpler than what your compilation will
do):

```
var f = function(x) {
  if(false) { "skip" }
  x + 1;
}
```

This function returns `undefined`; JavaScript requires that values are actually
`return`ed explicitly.  So the block compilation uses an
[iife](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression),
which looks like this:

```
var f = function(x) {
  return (function() {
      if(false) { "skip" }
      return x + 1;
    })();
}
```

In order to:

1. Make sure that the block can be used as an expression;
2. Make sure that the last value in the block is returned.

This kind of pattern, where there is a mismatch between the structure of Pyret
and the structure of JavaScript, will come up often in this compilation, and
part of your job on this assignment is to identify where that happens, and
figure out how to deal with it.

```
  s-num(_, n)
  s-str(_, s)
  s-bool(_, b)
```

Primitive values.  It's OK to represent these as their JavaScript equivalents.

```
  s-if-else(_, branches, els)
    s-if-branch(_, test, body)
```

Example:

```
if 5 < 6: 2 + 2
else if 3 == 3: 2
else: 42
end
```

Runs `test`s in order, and runs the first `block` corresponding to a `test`
that evaluates to `true`.  Raises an error if any `test` evaluates to a
non-boolean value.

```
  s-obj(_, fields :: List<Member>)
    s-data-field(_, name :: String, value :: Expr)
    # don't need to handle mutable or method fields, s-data-field is the only
    # kind of Member
```

Examples:

```
{ x: 5, y: 6 + 6 }
{ }
```

Creates an object value that works with `s-dot` and `s-extend` below.

```
  s-dot(_, obj :: Expr, key :: String)
```

Examples:

```
o.x
link(1, empty).first
```

Evaluates `obj` to a value, raising an exception if the value isn't an object
or a data value.  Looks up the value of the field `key`, raising an exception
if the field isn't defined.

```
  s-extend(_, obj :: Expr, fields :: List<Member>)
```

Examples:

```
o.{ x: 5, y: 6 }
```

Evaluates `obj` to a value, raising an exception if the value isn't an object
(it is an error to extend a data value).  Evaluates all the `expr`s in the
fields to values, and creates a new object that has all the fields from the
original object plus the extension.  Names from the fields override fields in
the original object.

```
  x = 10
  var y = 12
  x + y

  # desugars to (you will compile):

  let x = 10,
      var y = 12:
    x + y
  end

  s-let-expr(_, binds :: LetBind, body :: Expr)
    s-let-bind(_, bind :: Bind, expr :: Expr)
    s-var-bind(_, bind :: Bind, expr :: Expr)

  s-bind(_, _, name :: Name, _)

  s-id(_, name)

  s-id-var(_, name)
```

Binds the `name`s to the corresponding `expr`s as either variables or
identifiers in the `body`.  Shadowing is allowed.  Variables can be updated
with `s-assign` (below), and their uses will appear as `s-id-var`s.
Identifiers cannot be updated, and their uses will appear as `s-id`s.

An `s-bind` contains a `name`, which has a `to-compiled` method you can use to
produce a unique string for that name.  This can be helpful to make sure that
shadowed instances of variables produce difference eventual identifiers in
compiled JavaScript.  Binds also contain an annotation, but for this
assignment, you can ignore it.

```
  s-assign(_, id :: Name, value :: Expr)
```

Examples:

```
  x := 10
```

Assigns the `value` to the variable.


```
  s-letrec(_, binds :: LetrecBind, body :: Expr)
    s-letrec-bind(_, bind :: Bind, expr :: Expr)

  s-id-letrec(_, name)
```

Binds the `name`s in the `bind`s to the corresponding values, but initializes
them to undefined values first.  Uses of letrec-bound identifiers will appear
as `s-id-letrec`s.  If an `s-id-letrec` is referenced in evaluation before it
is initialized by the corresponding branch, a runtime exception should be
raised.  For example, this should raise an exception:

```
letrec f = f: f end
```


```
  s-op(_, op :: String, left :: Expr, right :: Expr)
```

Examples:

```
  x + y
  4 < 5
  5 - 4
```


Evaluates `left` and `right` to values.  You need to handle these operators:

- `+`: Concatenates strings and adds numbers, raises an error otherwise
- `-`, `*`, `/`: Perform the corresponding floating-point arithmetic on numbers
- `<`, `>`, `<=`, `>=`: Compares strings (lexicographically) and compares
  numbers (inequality), raises an error otherwise
- `==`: Performs structural equality, throws errors if it compares function
  values
- `<=>`: Performs reference equality, throws errors if it compares function
  values

```
  s-lam(_, _, args :: List<Bind>, _, _, body, _)
  s-app(_, _fun :: Expr, args :: List<Expr>) with:
```

Examples:

```
f1 = lam(x): x + x end
f2 = lam(x, y, z): x + y + z end
f1(5)
f2(2, 3, 4)
```

`s-lam` evaluates to a closure that can be applied later (similar to closures
we've seen all semester).  An application with a non-function in function
position should raise an error, and an application with the wrong number of
arguments should raise an error.  Note that JavaScript functions do not raise
an error when applied to the wrong number of arguments, so you will need to do
something extra here.


```
  s-data-expr(_, name, _, _, _, variants, _, _)
    s-singleton-variant(_, name, _)
    s-variant(_, _, name, members, _)
      s-variant-member(_, member-type, bind)
        s-normal # don't need to handle mutable (ref) fields
```

There isn't any direct surface syntax of Pyret that corresponds to
`s-data-expr`; your compiler sees a slightly modified form of the original AST.
A surface program like:

```
data List:
  | empty
  | link(f, r)
end
link(1, empty).f
```

is transformed to

```
letrec 
    List = data-expr List: | empty | link(f, r) end,
    is-List = List.List,
    is-empty = List.is-empty,
    empty = List.empty,
    is-link = List.is-link,
    link = List.link:
  link(1, empty).f
end
```

This means that your compilation of `s-data-expr` should produce an object
with:

- A field `name` that contains a single-argument function that returns true for
  values of the datatype, and false for all other values
- A field `variant.name` (e.g. "link", "empty") for each variant of the
  datatype, which for non-singleton cases is a function that constructs
  elements of that variant, and for singleton cases is the single instance of
  that variant.
- A field `is-variant.name` (e.g. "is-link", "is-empty") for each variant of
  the datatype, which is a single-argument function that returns true for
  values of the variant, and false for all other values.

The desugaring above unpacks this value so that the program "below" the data
definition can use the identifiers "is-link", "is-empty", etc.

```
s-cases(_, typ, val, branches)
  s-cases-branch(_, variant-name, args, body)
    s-cases-bind(_, _, bind) # no need to handle s-cases-bind-ref
  s-cases-singleton-branch(_, variant-name, body)
```

Examples:

```
cases(List) link(1, empty):
  | empty => 0
  | link(f, r) => 1
end
```

`s-cases` evaluates the branch whose name corresponds to the name of the
constructor of the value in `val` position, binding the fields of the datatype
to the bindings given in the branch.  For this assignment, ignore the type
position (the annotation in parentheses).  

Cases should error if:

- The provided value was not constructed with `data`
- The wrong number of arguments are provided in the branch (e.g. if the `link`
  case has some number of arguments other than 2)
- A singleton case is used for a non-singleton variant or vice-versa
- No case matches the provided value

Compiling `s-cases` depends heavily on how you choose to build up values in
`data` constructors.  You might (these are just examples):

- Store the constructor name at creation time, and compile cases to look for
  that information on the compiled value
- Store a method on each constructed data value, and compile cases to call that
  method with a JavaScript object of a particular shape representing the cases

What are the space and time tradeoffs of the representations you chose?

