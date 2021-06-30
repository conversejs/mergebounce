ESLINT			?= ./node_modules/eslint/bin/eslint.js
KARMA			?= ./node_modules/karma/bin/karma
ROLLUP			?= ./node_modules/rollup/dist/bin/rollup

node_modules: package.json package-lock.json
	npm i

.PHONY: eslint
eslint: node_modules
	$(ESLINT) mergebounce.js

.PHONY: check
check: eslint dist
	$(KARMA) start karma.conf.js $(ARGS)


dist/mergebounce.js: node_modules mergebounce.js package.json
	$(ROLLUP) --config rollup.config.js

dist: dist/mergebounce.js
