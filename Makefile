.PHONY: all build dist

all: build

build: node_modules

# dev JS
dist/personalized-feed-stub.js: build
	mkdir -p dist
	cat config/wrap-start.frag > dist/personalized-feed-stub.js
	./node_modules/.bin/browserify index.js -r ./index.js:personalized-feed-stub >> dist/personalized-feed-stub.js
	cat config/wrap-end.frag >> dist/personalized-feed-stub.js	

# uglified JS
dist/personalized-feed-stub.min.js: dist/personalized-feed-stub.js
	cat dist/personalized-feed-stub.js | ./node_modules/.bin/uglifyjs > dist/personalized-feed-stub.min.js

# css
dist/personalized-feed-stub.css:
	cp index.css dist/personalized-feed-stub.css

dist: dist/personalized-feed-stub.js dist/personalized-feed-stub.min.js dist/personalized-feed-stub.css

watch: build
	./node_modules/.bin/watchify index.js -o dist/personalized-feed-example.min.js -s Livefyre.PersonalizedNewsFeed

# if package.json changes, install
node_modules: package.json
	npm install
	touch $@

server: build
	npm start

test: build
	# uses karma start
	npm test

clean:
	rm -rf node_modules dist

package: dist

env=dev
deploy: dist
	./node_modules/.bin/lfcdn -e $(env)

