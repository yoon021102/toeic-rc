# 토익 RC 노트 (PWA)

아이폰 Safari에서 홈 화면에 추가해 앱처럼 쓰는 토익 RC 학습 웹앱입니다. 빌드 과정 없이 HTML/CSS/JS만으로 되어 있습니다.

## 구성
| 파일 | 내용 |
|---|---|
| `index.html` | 화면 틀 (상단바 + 하단 탭 4개: 홈 / 문법 / 단어 / 팁) |
| `app.js` | 화면 전환, 퀴즈 채점, 플래시카드, 학습 기록 저장 |
| `styles.css` | 아이폰 스타일 (다크 모드, 노치 영역 대응) |
| `data/grammar.js` | 문법 주제 8개 (핵심 포인트, 예문, 퀴즈) |
| `data/vocab.js` | 빈출 단어 50개 (Day 1~5) |
| `data/tips.js` | Part 5 / 6 / 7 / 시간 관리 팁 |
| `sw.js`, `manifest.webmanifest`, `icons/` | 오프라인 동작과 홈 화면 아이콘 |

학습 기록(외운 단어, 퀴즈 정답)은 아이폰의 Safari 저장소에 남습니다.

## PC에서 미리 보기
```
cd toeic-rc-pwa
python -m http.server 8000
```
브라우저에서 http://localhost:8000 을 엽니다. (같은 와이파이의 아이폰에서는 `http://<PC IP>:8000` 으로도 볼 수 있지만, 홈 화면 앱/오프라인 기능은 HTTPS 주소에서만 제대로 동작합니다.)

## 아이폰에 설치하기
1. HTTPS 주소로 올립니다. 가장 쉬운 방법:
   - **Netlify Drop**: https://app.netlify.com/drop 에 `toeic-rc-pwa` 폴더를 끌어다 놓으면 주소가 바로 나옵니다.
   - 또는 GitHub 저장소에 올리고 Settings → Pages 를 켭니다.
2. 아이폰 Safari로 그 주소를 엽니다.
3. 공유 버튼 → **홈 화면에 추가**.

## 콘텐츠 추가하기
`data/` 폴더의 파일에 같은 형식으로 항목을 추가하면 됩니다. 수정 후 `sw.js`의 `VERSION` 값을 올리면(`v1` → `v2`) 설치된 앱에도 새 내용이 반영됩니다.
