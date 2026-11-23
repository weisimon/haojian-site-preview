# 毫剪 Milli Peak 官網｜靜態草稿（TE-aligned 2026-10-28）

純 HTML／CSS，沒有建置步驟、沒有框架、沒有外部 CDN、沒有 JavaScript（手機選單用原生 `<details>`）。所有路徑都是相對路徑。

構圖／節奏對齊 teenage.engineering OP–XY：黑底 hero 產品先行＋一行短標 → 短章節停頓＋美感大圖 → 細節圓（h3＋一句說明）→ 規格帶（已確認欄）→ 購買後置 payoff。

## 結構

- `index.html` — 首頁（slogan 置中 → 大圖 → 2×2 產品卡）
- `products/{fine,core,air,flow}.html` — 單品（TP-7 節奏）
- `story.html` — 品牌故事（人像待補）
- `assets/` — css / img / logo / fonts（Noto Sans TC Light 自架子集：`python /workspace/haojian/_qa/make_font.py` 重新產生，需 brotli）
- `_preview/` — 本機預覽截圖（不上 preview repo）

## 暫存預覽

https://raw.githack.com/weisimon/haojian-site-preview/master/index.html

重新產生頁面：`python3 /workspace/haojian/build_site.py`

## 設計師推薦網址示意（2026-11-23，僅示意，客人看不到）

- `mpa/` … `mpj/`：開啟後產生隨機 cookie `mp_vt`（看不出代號），立刻轉回首頁。預覽網址例：`https://raw.githack.com/weisimon/haojian-site-preview/master/mpa/index.html`
- 靜態站沒有伺服器，示意版把 token→代號對照存在瀏覽器 localStorage `mp_vt_demo`（開發者工具可看）；正式版由 WordPress 外掛 `wpicked-designer-ref` 在伺服器端 302＋HttpOnly cookie、資料表對照，網址為 `wpicked.com/mpa`。
- 商品深連結：`mpa/core/index.html` → 歸 mpa 後轉到 `products/core.html`（四款 fine／core／air／flow × mpa…mpj）。正式站為 `wpicked.com/mpa/core` → `/mp/core/`。
- 產生：`build_ref.py`（由 build_site.py 最後呼叫）。

## 2026-11-23 更新
- 價格：單支 NT$4,900／任選 3 把 NT$13,400／任選 4 把 NT$17,400（無折扣碼）。
- 保固 3 個月（非人為損壞免費維修；逾期仍協助維修，運費與維修費實報實銷）、產地中國：單品頁規格表＋購買區「保固與產地」＋全站頁尾。
