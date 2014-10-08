provide *

import ast as A
import "compiler/js-ast.arr" as J

fun helper-app(name, args):
  J.j-app(J.j-dot(J.j-id("$helpers"), name), args)
end

fun compile-expr(e :: A.Expr) -> J.JExpr:
  cases(A.Expr) e:
    | s-block(_, stmts) =>
      compiled-stmts = stmts.map(compile-expr)
      split = compiled-stmts.split-at(compiled-stmts.length() - 1)
      final = J.j-return(split.suffix.first)
      initial = split.prefix.map(J.j-expr)
      J.j-app(J.j-parens(J.j-fun([list:], J.j-block(initial + [list: final]))), [list:])

    | s-num(_, n) =>
      J.j-num(n)

    | s-str(_, s) =>
      J.j-str(s)

    | s-bool(_, b) =>
      if b: J.j-true else: J.j-false end

    | s-data-expr(_, name, _, _, _, variants, _, _) =>
      J.j-str("nyi: " + torepr(e))

    | s-dot(_, obj, key) =>
      J.j-str("nyi: " + torepr(e))

    | s-obj(_, fields) =>
      J.j-str("nyi: " + torepr(e))

    | s-id(_, name) =>
      J.j-str("nyi: " + torepr(e))

    | s-id-var(_, name) =>
      J.j-str("nyi: " + torepr(e))

    | s-id-letrec(_, name) =>
      J.j-str("nyi: " + torepr(e))

    | s-letrec(_, binds, body) =>
      J.j-str("nyi: " + torepr(e))

    | s-let-expr(_, binds, body) =>
      J.j-str("nyi: " + torepr(e))

    | s-assign(_, id, value) =>
      J.j-str("nyi: " + torepr(e))

    | s-if-else(_, branches, els) =>
      J.j-str("nyi: " + torepr(e))

    | s-cases(_, typ, val, branches) =>
      J.j-str("nyi: " + torepr(e))
    | s-cases-else(_, typ, val, branches) =>
      J.j-str("nyi: " + torepr(e))

    | s-op(_, op, left, right) =>
      ask:
        | op == "op-" then: helper-app("subtract", [list: compile-expr(left), compile-expr(right)])
        | otherwise: J.j-str("nyi: " + op)
      end

    | s-lam(_, _, args, ann, doc, body, tests) =>
      J.j-str("nyi: " + torepr(e))

    | s-extend(_, obj, fields) =>
      J.j-str("nyi: " + torepr(e))

    | else => raise("Unexpected expression: " + torepr(e))
  end
end


