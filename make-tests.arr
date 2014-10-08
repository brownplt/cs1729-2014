import filelib as FL
import ast as A
import parse-pyret as P

import "compiler/ast-util.arr" as U
import "compiler/compile-structs.arr" as CS
import "compiler/js-ast.arr" as J
import "compiler/resolve-scope.arr" as R

import "./compile.arr" as C

fun is-arr-file(filename):
  string-index-of(filename, ".arr") == (string-length(filename) - 4)
end

base = "./tests/"
good-progs = FL.list-files(base)
for each(prog from good-progs):
  when is-arr-file(prog):
    filename  = base + prog
    prog-file = FL.open-input-file(filename)
    prog-text = FL.read-file(prog-file)
    parsed = P.surface-parse(prog-text, filename)    
    nothinged = U.append-nothing-if-necessary(parsed)
    resolved = R.resolve-names(R.desugar-scope(nothinged.or-else(parsed), CS.no-builtins), CS.no-builtins)

    # NOTE(joe): This filters out some forms that we aren't dealing with for
    # this assignment (types, import/export, check blocks, etc)
    to-compile = resolved.ast.block.visit(A.default-map-visitor.{
      s-module(self, _, answer, _, _, _): answer.visit(self) end,
      s-type-let-expr(self, _, _, body): body.visit(self) end
    })

    desugarfile = FL.open-output-file(filename + ".core", false)
    FL.display(desugarfile, to-compile.tosource().pretty(80).join-str("\n"))

    result = C.compile-expr(A.s-block(to-compile.l, [list: to-compile]))
    wrapped = J.j-parens(J.j-fun([list: "$helpers"], J.j-block([list: J.j-return(result)])))
    outfile = FL.open-output-file(filename + ".js", false)
    FL.display(outfile, wrapped.tosource().pretty(80).join-str("\n") + "\n")
    FL.close-output-file(outfile)
    FL.close-input-file(prog-file)
  end
end

