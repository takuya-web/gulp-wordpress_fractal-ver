# 【使い方】

## --ディレクトリ構造--

```
gulp_wordpress
├─ htdocs
├─ node_modules
├─ production     //作業ディレクトリです。
|  ├─js
|  ├─php
|  └─sass
├─ src
|  ├─sass
|  └─styleguide
|    ├─components
|    └─docs
├─ styleguide
├─ gulpfile.js    //gulp設定ファイル
├─ package.json
├─ package-lock.json
└─ README.md
```  
  
## --使用プラグイン--  
・gulp-sass  
・sass  
・gulp-plumber  
・gulp-notify  
・gulp-postcss  
・gulp-autoprefixer  
・browser-sync  
・minimist  
・@frctl/fractal  

## 1.Local by FlywheelでWordPress開発環境を構築  
※```style.css```は予めご用意下さい。

## 2.作業ディレクトリ
    wp-content
    |
    themes
    |
    "my theme"
    |
    ここで"git clone"して下さい。
  ``` $git clone https://github.com/takuya-web/gulp_wordpress.git ```

## 3.gulp_wordpressディレクトリに移動し、gulpを起動
``` $npx gulp --domain "サイトのドメイン" ```  
※サイトのドメイン名はLocal by Flywheelの"Site Domain"を入力

## 4.コーディング
PHP、Sass、Jsファイルの編集は```production```の中で行って下さい。

【基本的な動作】  
・Dart Sassコンパイル=>ベンダープレフィックス自動付与、メディアクエリの整理  
・起動時ローカルサーバーの立ち上げ  
・production/sass・php・jsファイルの変更を監視。変更があった場合はブラウザを自動でリロード。  
※sassの変更に関してはリロードは行われず、変更部分だけ反映されます。

## 4.スタイルガイド
```src```の中で行って下さい。
HTML：src-styleguide-components内で「ファイル名.hbs」  
CSS ：sass内  
※その他はfractal公式をご参考願います。  
``` https://fractal.build/ ```