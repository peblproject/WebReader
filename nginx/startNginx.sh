#!/bin/sh

mkdir -p /etc/nginx/conf.d/

cp /etc/nginx/templates/reader.conf.template /etc/nginx/conf.d/default.conf

sed -ie "s|__READER_SERVER_NAME__|$READER_SERVER_NAME|g" /etc/nginx/conf.d/default.conf
sed -ie "s|__HTTP_SERVICES_ENDPOINT__|$HTTP_SERVICES_ENDPOINT|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__WS_SERVICES_ENDPOINT__|$WS_SERVICES_ENDPOINT|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__USE_GOOGLE_LOGIN__|$USE_GOOGLE_LOGIN|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__USE_OPEN_ID__|$USE_OPEN_ID|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__GOOGLE_CLIENT_ID__|$GOOGLE_CLIENT_ID|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__READER_FAVICON__|$READER_FAVICON|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__READER_LOGIN_IMAGE__|$READER_LOGIN_IMAGE|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__PEBL_LIBRARY_TITLE__|$PEBL_LIBRARY_TITLE|g" /usr/share/nginx/html/scripts/pack.js
sed -ie "s|__PEBL_READER_TITLE__|$PEBL_READER_TITLE|g" /usr/share/nginx/html/scripts/pack.js
sed -ie "s|__PEBL_TITLE__|$PEBL_TITLE|g" /usr/share/nginx/html/scripts/pack.js
sed -ie "s|__PEBL_WEBREADER_LOGO__|$PEBL_WEBREADER_LOGO|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__READER_DISABLED_FEATURES__|$READER_DISABLED_FEATURES|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__READER_HIDE_INSTALL_INSTRUCTIONS__|$READER_HIDE_INSTALL_INSTRUCTIONS|g" /usr/share/nginx/html/scripts/config.js
sed -ie "s|__GUEST_LOGIN__|$GUEST_LOGIN|g" /usr/share/nginx/html/scripts/config.js

nginx -g "daemon off;"
