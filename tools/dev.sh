#!/bin/bash

# ./tools/dev.sh

# Build the site
echo "Building site..."
deno run --allow-read --allow-write tools/convert.js

# Start the server
echo "Starting server..."
python3 -m http.server 