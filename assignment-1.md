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
  if test1:
    block
  else if test2:
    block
  ...
  else:
    block
  end

  s-if-else(_, branches, els)
    s-if-branch(_, test, body)
```

Runs `test`s in order, and runs the first `block` corresponding to a `test`
that evaluates to `true`.  Raises an error if any `test` evaluates to a
non-boolean value.

```
  { name: expr, ... }

  s-obj(_, fields :: List<Member>)
    s-data-field(_, name :: String, value :: Expr)
    # don't need to handle mutable or method fields, s-data-field is the only
    # kind of Member
```

Creates an object value that works with `s-dot` and `s-extend` below.

```
  expr.name

  s-dot(_, obj :: Expr, key :: String)
```

Evaluates `obj` to a value, raising an exception if the value isn't an object
or a data value.  Looks up the value of the field `key`, raising an exception
if the field isn't defined.

```
  expr.{ name: expr, ... }

  s-extend(_, obj :: Expr, fields :: List<Member>)
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
compiled JavaScript.

```
  x := 10

  s-assign(_, id :: Name, value :: Expr)
```


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
  x + y
  4 < 5
  5 - 4 - 3

  s-op(_, op :: String, left :: Expr, right :: Expr)
```

Evaluates `left` and `right` to values.  You need to handle these operators:

- `+`: Concatenates strings and adds numbers, raises an error otherwise
- `-`, `*`, `/`: Perform the corresponding floating-point arithmetic on numbers
- `<`, `>`, `<=`, `>=`: Compares strings and compares numbers, raises an error
  otherwise
- `==`: Performs structural equality, throws errors if it compares function
  values
- `<=>`: Performs reference equality, throws errors if it compares function
  values


```
  s-lam(_, _, args :: List<Bind>, _, _, body, _)
  s-app(_, _fun :: Expr, args :: List<Expr>) with:
```


```
  s-data-expr(_, name, _, _, _, variants, _, _)
    s-singleton-variant(_, name, _)
    s-variant(_, _, name, members, _)
      s-variant-member(_, member-type, bind)
        s-normal # don't need to handle mutable (ref) fields

  s-cases-else(_, typ, val, branches)
    s-cases-branch(_, variant-name, args, body)
      s-cases-bind(_, _, bind) # no need to handle s-cases-bind-ref
    s-cases-singleton-branch(_, variant-name, body)
```
