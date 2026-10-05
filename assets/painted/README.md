# 냥공부 승인 원화 적용

2026-10-04 승인한 고양이/방 시안을 참고해 내장 ImageGen으로 제작한 실제 PNG 리소스다. SVG 도형으로 비슷하게 다시 그리지 않는다. `painted.js`의 SVG는 PNG의 필요한 영역을 잘라 보여주는 창이며, 원화의 선과 질감을 그대로 사용한다.

| 파일 | 사용 |
| --- | --- |
| `empty-room.png` | 벽·바닥만 있는 기본 방. 가구, 창문, 러그, 고양이 없음 |
| `lemon-poses.png` | 승인한 치즈 고양이의 앉기·걷기·잠자기·공부·기쁨·얼굴 |
| `furniture.png` | 승인한 시안의 창문·책장·책상·러그·방석·화분 및 시계·박스·캣타워 |
| `seasonal.png` | 같은 그림체의 계절 물품 18개 |
| `room-*.jpg` | 테마마다 별도로 그린 빈 벽과 바닥. 구매 장식은 별도 레이어 |

새 이미지 제작 시 승인 시안을 참고 이미지로 첨부한다. 지시문:

> Preserve the approved painted illustrations: warm cocoa hand-drawn outlines, watercolor/paper texture inside the objects, rounded shapes, warm ivory, muted pastel colors. For the cat, preserve its exact orange-and-white patches, olive eyes and face proportions. Do not simplify into vector shapes. Produce real transparent backgrounds for characters and items. Keep each complete object isolated with padding and no neighboring fragments. Room backgrounds must contain ONLY the empty wall and floor; no furniture, window, rug, cushion or cat. Every collectible is a separate optional layer.

추가 원칙:

- 물품의 기존 ID와 공부·구매 기록은 유지한다.
- 첫 방은 빈 방이다. 물품을 획득하거나 구매하고 배치한 뒤에만 표시한다.
- 생성한 atlas의 정렬을 추정하지 않는다. 실제 그림 경계를 확인해 `painted.js` 좌표를 맞춘다.
- 이미지 원본의 투명도를 유지한다. 브라우저에서 배경 비침과 잘림을 확인한다.
- `art-preview.html`은 실제 게임과 같은 원화를 사용하는 검수 화면이며, 보유 기록을 바꾸지 않는다.
- 로컬 서버는 `/tmp/nyang-study-preview` 복사본을 제공하므로 수정 후 해당 폴더도 갱신한다.


## Accessories and photo frames (2026-10-05)
All 24 accessories now share three alpha PNG atlases; 28 photo frames share two alpha PNG atlases. The profile glasses use a separate illustration. `painted.js` holds crop boxes and pose-relative anchors; use these assets for shop icons, photo decorations, and drawn cats alike. Preserve item IDs and saved ownership when changing artwork.

Reusable prompt: Match the approved furniture and accessory references: delicate warm cocoa hand-drawn contours, soft pastel watercolor with paper grain inside objects, rounded handmade shapes. Draw isolated game assets with actual alpha transparency outside each object and inside eyeglass lenses/photo frame openings. No text, no background, no solid lens fills, no heavy vector outline. Use an evenly spaced atlas with ample transparent margins and a supplied explicit row-by-row item order. Generate side-facing glasses separately; verify every pose, crop boundary, and frame hole in art-preview.html before release.
