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
    src/util/util.js > dist/Code.gs

# Copy user customizable files to the dist directory
cp src/user/config.js dist/config.gs
cp src/user/source.js dist/source.gs

# Remove import/export statements in bundle.js
sed -i '' '/^import/d' dist/Code.gs
sed -i '' 's/^export default //g' dist/Code.gs
sed -i '' 's/^export //g' dist/Code.gs

# Remove import/export statements in config files
for file in dist/config.gs dist/source.gs; do
  sed -i '' '/^export default/d' "$file"
  sed -i '' 's/^export //g' "$file"
  sed -i '' '${/^$/d;}' "$file"
done

echo "Bundling complete."
