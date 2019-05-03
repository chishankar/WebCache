 
# Webcache

 	
Webcache is standalone application that allows users to cache webpages as they appear at the time of saving. The user can then highlight text on the page and add annotations to the highlighted text. Webcache allows search through document texts and annotations.


## Features




### Save webpage
Click the cache button in the toolbar, second from the left, and enter a URL in the text box. WebCache will retrieve the webpage’s HTML, Javascript, and CSS. The page will then be displayed fully-rendered in the application. Once a page is cached, it’s saved and indexed by the application and can be opened at any point in the future.
### Highlight text
Click the highlight icon on the top left the toolbar and select a color. Select text to highlight it in that color. Highlighted segments of text will appear in the right sidebar and can be selected to travel to that section of the page. Click “save” to save highlights to the page. The current page can be closed and reopened and highlights will persist. Highlights can be toggled on and off by an option in the right sidebar. 
### Add comments to highlight
Once text is highlighted, the user can select the highlight instance in the right toolbar and attach a comment. Comments can be deleted, and clicking on a comment will take you to the text where it's anchored.

### Search text and annotations
Click on the search icon on the right of the top toolbar and enter text to search through all cached documents for the keyword(s). Matches will appear on the right toolbar and can be clicked on to open the respective pages.
### Import legacy data 
Past user of Scrapbook for Firefox, or similar? Enjoy compatibility with your old cached pages. Click “import legacy data” to transfer your caches, including annotations. All features will be available on the imported pages.

## Stack

  Electron, React, ReduxJS


## Dependencies:
    "name": "electron-react-boilerplate",

      "productName": "ElectronReact",

      "version": "0.17.1",
      
      "description": "Electron application boilerplate based on React, React Router, Webpack, React Hot Loader for rapid application development",
      "scripts": {
        "build": "concurrently \"yarn build-main\" \"yarn build-renderer\"",
        "build-dll": "cross-env NODE_ENV=development webpack --config ./configs/webpack.config.renderer.dev.dll.babel.js --colors",
        "build-e2e": "cross-env E2E_BUILD=true yarn build",
        "build-main": "cross-env NODE_ENV=production webpack --config ./configs/webpack.config.main.prod.babel.js --colors",
        "build-renderer": "cross-env NODE_ENV=production webpack --config ./configs/webpack.config.renderer.prod.babel.js --colors",
        "dev": "cross-env START_HOT=1 node -r @babel/register ./internals/scripts/CheckPortInUse.js && cross-env START_HOT=1 yarn start-renderer-dev",
        "flow": "flow",
        "flow-typed": "rimraf flow-typed/npm && flow-typed install --overwrite || true",
        "lint": "cross-env NODE_ENV=development eslint --cache --format=pretty .",
        "lint-fix": "yarn --silent lint --fix; exit 0",
        "lint-styles": "stylelint --ignore-path .eslintignore '**/*.*(css|scss)' --syntax scss",
        "lint-styles-fix": "yarn --silent lint-styles --fix; exit 0",
        "package": "yarn build && electron-builder build --publish never",
        "package-all": "yarn build && electron-builder build -mwl",
        "package-ci": "yarn postinstall && yarn build && electron-builder --publish always",
        "package-linux": "yarn build && electron-builder build --linux",
        "package-win": "yarn build && electron-builder build --win --x64",
        "postinstall": "yarn flow-typed && electron-builder install-app-deps package.json && yarn build-dll && opencollective-postinstall",
        "postlint-fix": "prettier --ignore-path .eslintignore --single-quote --write '**/*.{js,jsx,json,html,css,less,scss,yml}'",
        "postlint-styles-fix": "prettier --ignore-path .eslintignore --single-quote --write '**/*.{css,scss}'",
        "preinstall": "node ./internals/scripts/CheckYarn.js",
        "prestart": "yarn build",
        "start": "cross-env NODE_ENV=production electron ./app/main.prod.js",
        "start-main-dev": "cross-env HOT=1 NODE_ENV=development electron -r @babel/register ./app/main.dev.js",
        "start-renderer-dev": "cross-env NODE_ENV=development webpack-dev-server --config configs/webpack.config.renderer.dev.babel.js",
        "test": "cross-env NODE_ENV=test BABEL_DISABLE_CACHE=1 jest",
        "test-all": "yarn lint && yarn flow && yarn build && yarn test && yarn build-e2e && yarn test-e2e",
        "test-e2e": "node -r @babel/register ./internals/scripts/CheckBuiltsExist.js && cross-env NODE_ENV=test testcafe electron:./ ./test/e2e/HomePage.e2e.js",
        "test-e2e-live": "node -r @babel/register ./internals/scripts/CheckBuiltsExist.js && cross-env NODE_ENV=test testcafe-live electron:./ ./test/e2e/HomePage.e2e.js",
        "test-watch": "yarn test --watch"
      },
      "lint-staged": {
        "*.{js,jsx}": [
          "cross-env NODE_ENV=development eslint --cache --format=pretty",
          "git add"
        ],
        "{*.json,.{babelrc,eslintrc,prettierrc,stylelintrc}}": [
          "prettier --ignore-path .eslintignore --parser json --write",
          "git add"
        ],
        "*.{css,scss}": [
          "stylelint --ignore-path .eslintignore --syntax scss --fix",
          "prettier --ignore-path .eslintignore --single-quote --write",
          "git add"
        ],
        "*.{html,md,yml}": [
          "prettier --ignore-path .eslintignore --single-quote --write",
          "git add"
        ]
      },
      "main": "./app/main.prod.js",
      "build": {
        "productName": "ElectronReact",
        "appId": "org.develar.ElectronReact",
        "files": [
          "app/dist/",
          "app/app.html",
          "app/main.prod.js",
          "app/main.prod.js.map",
          "package.json"
        ],
        "dmg": {
          "contents": [
            {
              "x": 130,
              "y": 220
            },
            {
              "x": 410,
              "y": 220,
              "type": "link",
              "path": "/Applications"
            }
          ]
        },
        "win": {
          "target": [
            "nsis",
            "msi"
          ]
        },
        "linux": {
          "target": [
            "deb",
            "rpm",
            "snap",
            "AppImage"
          ],
          "category": "Development"
        },
        "directories": {
          "buildResources": "resources",
          "output": "release"
        },
        "publish": {
          "provider": "github",
          "owner": "electron-react-boilerplate",
          "repo": "electron-react-boilerplate",
          "private": false
        }
      },
      "repository": {
        "type": "git",
        "url": "git+https://github.com/electron-react-boilerplate/electron-react-boilerplate.git"
      },
      "author": {
        "name": "Electron React Boilerplate Maintainers",
        "email": "electronreactboilerplate@gmail.com",
        "url": "https://electron-react-boilerplate.js.org"
      },
      "contributors": [
        {
          "name": "Vikram Rangaraj",
          "email": "vikr01@icloud.com",
          "url": "https://github.com/vikr01"
        },
        {
          "name": "Amila Welihinda",
          "email": "amilajack@gmail.com",
          "url": "https://github.com/amilajack"
        }
      ],
      "license": "MIT",
      "bugs": {
        "url": "https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues"
      },
      "keywords": [
        "electron",
        "boilerplate",
        "react",
        "redux",
        "flow",
        "sass",
        "webpack",
        "hot",
        "reload"
      ],
      "homepage": "https://github.com/electron-react-boilerplate/electron-react-boilerplate#readme",
      "jest": {
        "testURL": "http://localhost/",
        "moduleNameMapper": {
          "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/internals/mocks/fileMock.js",
          "\\.(css|less|sass|scss)$": "identity-obj-proxy"
        },
        "moduleFileExtensions": [
          "js",
          "jsx",
          "json"
        ],
        "transform": {
          "^.+\\.jsx?$": "babel-jest"
        },
        "setupFiles": [
          "./internals/scripts/CheckBuiltsExist.js"
        ]
      },
      "devDependencies": {
        "@babel/core": "^7.2.2",
        "@babel/plugin-proposal-class-properties": "^7.2.3",
        "@babel/plugin-proposal-decorators": "^7.2.3",
        "@babel/plugin-proposal-do-expressions": "^7.2.0",
        "@babel/plugin-proposal-export-default-from": "^7.2.0",
        "@babel/plugin-proposal-export-namespace-from": "^7.2.0",
        "@babel/plugin-proposal-function-bind": "^7.2.0",
        "@babel/plugin-proposal-function-sent": "^7.2.0",
        "@babel/plugin-proposal-json-strings": "^7.2.0",
        "@babel/plugin-proposal-logical-assignment-operators": "^7.2.0",
        "@babel/plugin-proposal-nullish-coalescing-operator": "^7.2.0",
        "@babel/plugin-proposal-numeric-separator": "^7.2.0",
        "@babel/plugin-proposal-optional-chaining": "^7.2.0",
        "@babel/plugin-proposal-pipeline-operator": "^7.2.0",
        "@babel/plugin-proposal-throw-expressions": "^7.2.0",
        "@babel/plugin-syntax-dynamic-import": "^7.2.0",
        "@babel/plugin-syntax-import-meta": "^7.2.0",
        "@babel/plugin-transform-react-constant-elements": "^7.2.0",
        "@babel/plugin-transform-react-inline-elements": "^7.2.0",
        "@babel/preset-env": "^7.2.3",
        "@babel/preset-flow": "^7.0.0",
        "@babel/preset-react": "^7.0.0",
        "@babel/register": "^7.0.0",
        "babel-core": "7.0.0-bridge.0",
        "babel-eslint": "^10.0.1",
        "babel-jest": "^23.6.0",
        "babel-loader": "^8.0.4",
        "babel-plugin-dev-expression": "^0.2.1",
        "babel-plugin-transform-react-remove-prop-types": "^0.4.21",
        "chalk": "^2.4.1",
        "concurrently": "^4.1.0",
        "cross-env": "^5.2.0",
        "cross-spawn": "^6.0.5",
        "css-loader": "^2.1.0",
        "detect-port": "^1.3.0",
        "electron": "^4.0.0",
        "electron-builder": "^20.38.4",
        "electron-devtools-installer": "^2.2.4",
        "enzyme": "^3.8.0",
        "enzyme-adapter-react-16": "^1.7.1",
        "enzyme-to-json": "^3.3.5",
        "eslint": "^5.11.0",
        "eslint-config-airbnb": "^17.1.0",
        "eslint-config-erb": "^0.0.2",
        "eslint-config-prettier": "^3.3.0",
        "eslint-formatter-pretty": "^2.0.0",
        "eslint-import-resolver-webpack": "^0.10.1",
        "eslint-plugin-compat": "^2.6.3",
        "eslint-plugin-flowtype": "^3.2.0",
        "eslint-plugin-import": "^2.14.0",
        "eslint-plugin-jest": "^22.1.2",
        "eslint-plugin-jsx-a11y": "6.1.2",
        "eslint-plugin-prettier": "^3.0.0",
        "eslint-plugin-promise": "^4.0.1",
        "eslint-plugin-react": "^7.11.1",
        "eslint-plugin-testcafe": "^0.2.1",
        "fbjs-scripts": "^1.0.1",
        "file-loader": "^3.0.1",
        "flow-bin": "^0.77.0",
        "flow-runtime": "^0.17.0",
        "flow-typed": "^2.5.1",
        "husky": "^1.3.0",
        "identity-obj-proxy": "^3.0.0",
        "jest": "^23.6.0",
        "lint-staged": "^8.1.0",
        "mini-css-extract-plugin": "^0.5.0",
        "node-sass": "^4.11.0",
        "opencollective-postinstall": "^2.0.1",
        "optimize-css-assets-webpack-plugin": "^5.0.1",
        "prettier": "^1.15.3",
        "react-test-renderer": "^16.7.0",
        "redux-logger": "^3.0.6",
        "rimraf": "^2.6.2",
        "sass-loader": "^7.1.0",
        "sinon": "^7.2.2",
        "spectron": "^5.0.0",
        "style-loader": "^0.23.1",
        "stylelint": "^9.9.0",
        "stylelint-config-prettier": "^4.0.0",
        "stylelint-config-standard": "^18.2.0",
        "terser-webpack-plugin": "^1.2.0",
        "testcafe": "^0.23.3",
        "testcafe-browser-provider-electron": "^0.0.8",
        "testcafe-live": "^0.1.4",
        "testcafe-react-selectors": "^3.0.2",
        "url-loader": "^1.1.2",
        "webpack": "^4.28.2",
        "webpack-bundle-analyzer": "^3.0.3",
        "webpack-cli": "^3.1.2",
        "webpack-dev-server": "^3.1.14",
        "webpack-merge": "^4.1.5",
        "yarn": "^1.12.3"
      },
      "dependencies": {
        "@fortawesome/fontawesome-free": "^5.6.3",
        "@material-ui/core": "^3.9.3",
        "@material-ui/icons": "^3.0.2",
        "bson": "^4.0.2",
        "classnames": "^2.2.6",
        "connected-react-router": "^5.0.1",
        "create-react-class": "^15.6.3",
        "devtron": "^1.4.0",
        "electron-debug": "^2.0.0",
        "electron-log": "^2.2.17",
        "electron-updater": "^4.0.6",
        "font-awesome": "^4.7.0",
        "highlightable": "^1.0.7",
        "history": "^4.7.2",
        "jsdom": "^15.0.0",
        "object-sizeof": "^1.3.0",
        "react": "^16.7.0",
        "react-dnd": "^7.4.5",
        "react-dnd-html5-backend": "^7.4.4",
        "react-dom": "^16.7.0",
        "react-filetree-electron": "^1.2.2",
        "react-fontawesome": "^1.6.1",
        "react-highlighter": "^0.4.3",
        "react-hot-loader": "^4.6.3",
        "react-keyed-file-browser": "^1.4.3",
        "react-notifications": "^1.4.3",
        "react-redux": "^5.1.1",
        "react-router": "^4.3.1",
        "react-router-dom": "^4.3.1",
        "react-tooltip": "^3.10.0",
        "redux": "^4.0.1",
        "redux-thunk": "^2.3.0",
        "source-map-support": "^0.5.9",
        "website-scraper": "^4.0.0"
      },
      "devEngines": {
        "node": ">=7.x",
        "npm": ">=4.x",
        "yarn": ">=0.21.3"
      },
      "collective": {
        "url": "https://opencollective.com/electron-react-boilerplate-594"
      },
      "browserslist": "electron 1.6",
      "husky": {
        "hooks": {
          "pre-commit": "lint-staged"
        }
      }
<h1>WebCache</h1>
<p><b>Authors: </b>Chirag Shankar, Akbar Baig, CJ Okeke, Cory Blair, Kaan, Ming Ye, Peter Wang</p>

<h1>Technologies</h1>
<p>
  Electron React Boilerplate uses <a href="http://electron.atom.io/">Electron</a>, <a href="https://facebook.github.io/react/">React</a>, <a href="https://github.com/reactjs/redux">Redux</a>, <a href="https://github.com/reactjs/react-router">React Router</a>, <a href="http://webpack.github.io/docs/">Webpack</a> and <a href="https://github.com/gaearon/react-hot-loader">React Hot Loader</a> for rapid application development (HMR).
</p>

<br>
<div align="center">
  <a href="https://facebook.github.io/react/"><img src="./internals/img/react-padded-90.png" /></a>
  <a href="https://webpack.github.io/"><img src="./internals/img/webpack-padded-90.png" /></a>
  <a href="http://redux.js.org/"><img src="./internals/img/redux-padded-90.png" /></a>
  <a href="https://github.com/ReactTraining/react-router"><img src="./internals/img/react-router-padded-90.png" /></a>
  <a href="https://flowtype.org/"><img src="./internals/img/flow-padded-90.png" /></a>
  <a href="http://eslint.org/"><img src="./internals/img/eslint-padded-90.png" /></a>
  <a href="https://facebook.github.io/jest/"><img src="./internals/img/jest-padded-90.png" /></a>
  <a href="https://yarnpkg.com/"><img src="./internals/img/yarn-padded-90.png" /></a>
</div>
<hr />
<br />

<div align="center">

[![Build Status][travis-image]][travis-url]
[![Appveyor Build Status][appveyor-image]][appveyor-url]
[![Dependency Status][david-image]][david-url]
[![DevDependency Status][david-dev-image]][david-dev-url]
[![Github Tag][github-tag-image]][github-tag-url]

[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/electron-react-blpt)
[![OpenCollective](https://opencollective.com/electron-react-boilerplate/backers/badge.svg)](#backers)
[![OpenCollective](https://opencollective.com/electron-react-boilerplate/sponsors/badge.svg)](#sponsors)
[![StackOverflow](http://img.shields.io/badge/stackoverflow-electron_react_boilerplate-blue.svg)](http://stackoverflow.com/questions/tagged/electron-react-boilerplate)

</div>

<h1>Installation</h1>

First, clone the repo via git:

```bash
git clone https://github.com/chishankar/WebCache.git
```

And then install the dependencies with yarn.

```bash
$ cd your-project-name
$ yarn
```

## Starting Development

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
$ yarn dev
```

## Packaging for Production

To package apps for the local platform:

```bash
$ yarn package
```
