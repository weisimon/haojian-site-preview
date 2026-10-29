# 毫剪 Milli Peak 官網｜靜態草稿（TE-aligned 2026-10-28）

純 HTML／CSS，沒有建置步驟、沒有框架、沒有外部 CDN、沒有 JavaScript（手機選單用原生 `<details>`）。所有路徑都是相對路徑。

構圖／節奏對齊 teenage.engineering OP–XY：黑底 hero 產品先行＋一行短標 → 短章節停頓＋美感大圖 → 細節圓（h3＋一句說明）→ 規格帶（已確認欄）→ 購買後置 payoff。

## 結構

- `index.html` — 首頁（slogan 置中 → 大圖 → 2×2 產品卡）
- `products/{fine,core,air,flow}.html` — 單品（TP-7 節奏）
- `story.html` — 品牌故事（人像待補）
- `contact.html` — 聯絡 stub
- `assets/` — css / img / logo / video
- `_preview/` — 本機預覽截圖（不上 preview repo）

## 暫存預覽

https://raw.githack.com/weisimon/haojian-site-preview/master/index.html

重新產生頁面：`python3 /workspace/haojian/build_site.py`
