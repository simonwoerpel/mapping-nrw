# mapping-nrw
considerations about mapping nrw differently

## build deps

`npm install babel-cli babel-preset-es2015 uglify-js node-sass`

### js

`babel nrw-maps.js | uglifyjs -c -m > nrw-maps.min.js`

### css

`sass -t compressed style.scss:style.css`
