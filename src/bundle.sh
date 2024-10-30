#!/bin/bash
if [ -d dist ]; then
  rm -rf dist/*
else
  mkdir -p dist
fi

# Concatenate files into bundle.js
cat src/main.js \
    src/controller/controller.js \
    src/domain/domain.js \
    src/service/service.js \
    src/util/template.js \
    src/util/error.js \
    src/util/util.js > dist/bundle.js

# Copy user customizable files to the dist directory
cp src/user/config.js dist/config.js
cp src/user/newsSource.js dist/newsSource.js

# Remove import/export statements in bundle.js
sed -i '' '/^import/d' dist/bundle.js
sed -i '' 's/^export default //g' dist/bundle.js
sed -i '' 's/^export //g' dist/bundle.js

# Remove import/export statements in config files
for file in dist/config.js dist/newsSource.js; do
  sed -i '' '/^export default/d' "$file"
  sed -i '' 's/^export //g' "$file"
  sed -i '' '/^$/d' "$file"
done

echo "Bundling complete."
