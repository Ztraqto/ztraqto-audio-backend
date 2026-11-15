# ztraqto-audio-backend

[audio.ztraqto.com](https://audio.ztraqto.com) に載せる製品・カテゴリ・お知らせ・画像です。
**このリポジトリの `main` に JSON を置くと、5分以内にサイトに載ります。** サイト側での操作はいりません。

```
products/<URL名>.json   製品1つにつき1ファイル。ファイル名がページのURLになる（products/athena-qx.json → /p/athena-qx）
images/<URL名>/…        製品の画像（PNG・JPEG・WebP・AVIF・GIF。SVG は不可）
categories.json         カテゴリ
site.json               ページ上部のお知らせ、トップページの一文
schema/                 JSON の書き方（VS Code などで補完と確認が効く）
```

## 製品を載せる

1. 画像を `images/<URL名>/` に入れる（横 1200〜2400px の WebP がおすすめ）
2. `products/athena-qx.json` をコピーして `products/<URL名>.json` を作り、書き換える
3. `main` にコミット（GitHub の画面からアップロードしても同じ）

| 項目 | 内容 |
|---|---|
| `status` | `"published"` 一覧に出す（省略時） / `"hidden"` URLを知っている人だけ / `"draft"` 出さない |
| `name` `tagline` `summary` | 製品名、キャッチコピー、概要 |
| `category` | `categories.json` の `slug` |
| `tags` | `NEW` `BETA` `UPDATE` `COMING_SOON` `LIMITED`。「セール」「無料」は価格から自動 |
| `price` | 円。`0` で「無料」 |
| `sale` | `{ "price": 6800, "startsAt": "2026-12-01", "endsAt": "2026-12-31T23:59", "label": "発売記念" }`。時刻は時差を書かなければ日本時間。終了日時があるとカウントダウンが出る |
| `buyUrl` `demoUrl` `manualUrl` | https の booth.pm / ztraqto.com。**公開（published）には `buyUrl` か `COMING_SOON` が必要** |
| `hero` `icon` | `"images/athena-qx/hero.webp"` のようなパス |
| `accent` `visual` | 製品の色（`#9B7BFF`）、画像がないときの動く絵（`eq` `wave` `spectrum` `orbit`） |
| `licenseProductId` | License の製品ID（`ZAATQ001`）。持っている人に「所有しています」を出す |
| `featured` `order` | `true` の最初の製品がトップの大きな見出し。`order` が小さいほど先 |
| `sections` | ページの中身（下） |

`sections` の種類: `statement`（大見出し）、`feature`（特徴。`image` か `visual`）、`highlights`（ポイント）、`stats`（数字）、
`gallery`（`images` を横スクロール）、`specs`（仕様表）、`quote`（引用）、`video`（YouTube の動画ID）、`cta`（購入の呼びかけ）。
書き方は `products/athena-qx.json` と `schema/product.schema.json` を見てください。

### 画像

- `images/` のファイルは `"images/…"` と書くだけ。サイトは中身の id（git の blob）付きの URL で表示するので、同じ名前で差し替えてもすぐ新しい画像になる
- 外の画像は `https://raw.githubusercontent.com/…`、`https://cdn.jsdelivr.net/…`、`https://booth.pximg.net/…` だけ使える
- 1ファイル 10MB まで

## 消す・隠す

- ファイルを消すとページも消える
- 一時的に隠すなら `"status": "hidden"`（URLだけ）か `"draft"`

## 間違えたとき

- push ごとに GitHub Actions（check）が確認する。ローカルでは `node scripts/check.mjs`
- 通らないファイルはサイトに使われず、**前の正しい版が表示されたまま**になる。理由は https://audio.ztraqto.com/v1/catalog/status の `errors`
- 文章はそのまま文字として表示される（HTML・Markdown は使えない）
