# Ludumdare-basecode for PhaserJS game

Ludumdare-basecode auto upload PhaserJS game on GH-Pages.

## Features
 - Lint your code (optional) ;
 - Deploy your code on GH-Pages (don't forget to add `ACCESS_TOKEN` with public scope) ;
 - System anti-cache (Dynamicly load `game.js` to prevent bad things happened, user are not required to CTRL + F5).

## Usefull command

 - `npm run build`: Build the projet ;
 - `npm run watch`: Watch change to build you project (= live change) ;
 - `npm run zip`: Zip build folder ;
 - `npm run lint` and `npm run lint --fix`: Run lint & fix problems.

## Getting start

 1) Set [`ACCESS_TOKEN`](https://github.com/marketplace/actions/deploy-to-github-pages#required-setup) for deploy on GH-Pages and enable Github Action ;
 2) Edit `app.yml` ;
 3) `npm run build` ;
 4) `git commit -am ":D"` & `git push` ;
 5) Play !

## During coding

 1) Use `npm run watch` ;
 2) Open another console and `npm run localserver`.