# Assignment 1

Your task is to compile the subset of the Pyret ast in `compile.arr` to
JavaScript.  The compiled behavior should be the same as Pyret (with a few
exceptions noted below).  So, if you're not sure what a particular example
should do, run it in Pyret and that's the answer!

There are two AST types you need to know about for this assignment, the Pyret
AST and the JavaScript AST you will be compiling to.  Both are defined within
Pyret, if you need to refer to them, they are at
https://github.com/brownplt/pyret-lang/blob/master/src/arr/trove/ast.arr and
https://github.com/brownplt/pyret-lang/blob/master/src/arr/compiler/js-ast.arr.

You will compile the following forms from the Pyret AST.  There are underscores
in place of fields that your compilation doesn't need to deal with.  Each form
comes with a few examples.

```
  s-block(_, exprs)
```

Runs all the exprs and returns the value that the last one returned.

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
```

Creates an object value that works with `s-dot` and `s-extend` below.

```
  s-dot(_, obj :: Expr, key :: String)
```

Examples:

```
o.x
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

