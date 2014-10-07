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

Raises an error if any `test` evaluates to a non-boolean value.

```
  { name: expr, ... }

  s-obj(_, fields :: List<Member>)
    s-data-field(_, name :: String, value :: Expr)
    # don't need to handle mutable or method fields
```

Creates an object value that works with `s-dot` and `s-extend` below.

```
  s-dot(_, obj, key)
```


  s-letrec(_, binds, body)
    s-letrec-bind(_, bind, expr)

  s-let-expr(_, binds, body)
    s-let-bind(_, bind, expr)
    s-var-bind(_, bind, expr)

  s-bind(_, _, name, _)

  s-id(_, name)

  s-id-var(_, name)

  s-id-letrec(_, name)

  s-assign(_, id, value)

  s-op(_, op, left, right)

  s-lam(_, _, args, ann, doc, body, tests)

  s-extend(_, obj, fields)
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
