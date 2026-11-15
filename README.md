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
`gallery`（`images` を横スクロール）、`specs`（仕様表。`rows` か、見出しごとの `groups`）、`comparison`（比較表）、`points`（アピールの箇条書き。番号付きで最初の項目が大きい）、`offer`（Contributor 版などの案内。`url` は booth.pm / ztraqto.com / discord.gg / discord.com）、`quote`（引用）、`video`（YouTube の動画ID）、`cta`（購入の呼びかけ。`more` で「仕様と比較を見る」のような2つ目のボタン）、
`showcase`（紹介映像のように自動で動くアニメーション）。

### showcase（紹介アニメーション）

動画を作らなくても、サイトがプラグインの画面をその場で描いて、紹介映像のように再生します。ヒーローのすぐ下に置かれ（映像があるときヒーローの画面写真は出ません）、画面に入ると自動再生、ループします。
映像が初めて画面に入るとフローティングアーチが右下の角に開き（角に合わせて狭まる）、中央の点やボタンをつかんで動かせます（端では向きを変えて狭まる）。映像を見るまではページ下部に「紹介映像はこちら」のポップアップが出ます。映像を左クリック／右クリックするとアーチがそこに開き、前へ・再生／一時停止・次へ・閉じると、外周にチャプター（ホイールやドラッグで回せる）が出ます。
`scenes` に流したい場面を並べ、それぞれに字幕を付けます。

| action | 場面 |
|---|---|
| `title` | **タイトル**（最初に置く）：サムネイルになる画面（色付きのバンド、アーチ）に、`caption` を名前、`body` をサブタイトルとして描く |
| `arch` | **フローティングアーチ**：バンドを選ぶとアーチが開き、Hz・ゲイン・Q を順に操作、ホイールが回る |
| `dynamics` | アーチの外側にダイナミクスのアーチ（アンバー）、レンジを設定、音に合わせて動くカーブ |
| `resonance` | レゾナンス抑制の紫のアーチと、共振だけを抑える点線 |
| `multi` | 複数バンドを囲んで、まとめ用のアーチ（スケール） |
| `tabs` | ツールバーのタブからカードの観覧車を開き、別のトラックへ切り替え、元のトラックを重ねて表示 |
| `peaks` | 目立つピークに周波数と音名のラベル |
| `pick` | ラベルをつかんで下げ、ベルを作る |
| `bands` | 64 バンドが次々に置かれる |
| `phase` | 下のバーから最小位相・アナログ位相・リニアフェーズを選ぶ |
| `languages` | 設定の言語の一覧から 6 言語を順に選び、アーチやバーの文字が切り替わる |
| `performance` | 24 バンドが置かれたあと、CPU の実測値（1コアの 0.12 % ほか。値は映像のコードに固定） |
| `outro` | 締め：`caption` を名前、`body` をその下に描く |

- `arch` → `dynamics` → `resonance` と続けると、同じバンドのまま切れ目なくつながります
- `title` と `outro` は文字を映像の中に描くので、下の字幕は出ません
- `label` はアーチの外周のチャプターに出す短い名前（12文字まで、省略時は場面ごとの名前）
- `seconds` で長さ（2〜15秒、省略時 5）。色は製品の `accent`。例は `products/athena-qx.json` の最初のセクション

### comparison（比較表）

`columns` に製品名（2〜4）、`groups` に見出しごとの行を並べます。行の `values` は列と同じ数で、文字か `true`（○）/ `false`（―）。
`highlight` で強調する列（0 から）、`note` に出典などの注記。スマホでは行ごとに縦に並びます（横スクロールなし）。

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
