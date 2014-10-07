PYRET = node pyret-lang/build/phase1/main-wrapper.js

all: compile.arr.js make-tests.arr.js

%.arr.js: %.arr
	$(PYRET) --compile-module-js $< > $@

test: all
	$(PYRET) make-tests.arr
	node node_modules/mocha/bin/mocha run-tests.js

run-tests:
	node node_modules/mocha/bin/mocha run-tests.js
