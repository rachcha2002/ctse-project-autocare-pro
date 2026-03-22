#!/bin/sh
# Recreate config file
rm -rf /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment 
echo "window._env_ = {" >> /usr/share/nginx/html/env-config.js

# Note: Using env vars at runtime!
echo "  VITE_API_GATEWAY_URL: \"${VITE_API_GATEWAY_URL}\"," >> /usr/share/nginx/html/env-config.js

echo "}" >> /usr/share/nginx/html/env-config.js
