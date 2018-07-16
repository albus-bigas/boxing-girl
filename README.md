## リンク
### [BUYMA出品資料](https://docs.google.com/spreadsheets/d/1uE7yr18OTk6Q-_KJxOmOyNZvOxOhiaeHjxQiyaVHVW8/edit#gid=647604198)

### [箱入れ娘](https://docs.google.com/spreadsheets/d/1t7pld9RjYMovWK-cy5avRr9WsJiMMTiMMP7Xr2U7wKE/edit#gid=1666959935)


## 準備

```
git checkout master
git pull origin master
yarn
```

## やりかた
### 情報取得
1. BUYMA出品資料から箱入れ娘、元データ用シートにコピー
2. 元データ用シートをExport Sheet DataでJSON出力し、registディレクトリにファイル作成
3. chromeをでリモートデバッキングモードで立ち上げ

OS X

```
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary  --remote-debugging-port=9222 --disable-gpu
```

Windows

```
わからんけどこのオプションをつけてください --remote-debugging-port=9222 --disable-gpu
```

4. taobaoにログイン

5. auto_fukader.jsのbrowserWSEndpointにURLを貼り付け
    - winは[localhost:9222/json/version](localhost:9222/json/version)にアクセスしてコピー
6. auto_fukader.jsを実行

```
node auto_fukader.js xxxx.json
```

32行目`await end(browser)`のコメントアウトを外すと終了後にブラウザを閉じてしまうのでコメントアウトしたまま使うのがオススメ。

### 登録
1. 箱入れ娘、dist_dataシートのデータを修正
2. 画像をチェック、編集
3. dist_dataシートをExport Sheet DataでJSON出力し、distディレクトリのファイルに貼り付け
4. buyma_register.jsを実行

```
node buyma_register.js setting/fukada.json dist/xxxx_dist.json
```

5. 登録された商品からカラー、サイズ、タグを入力
