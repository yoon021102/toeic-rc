# 토익 RC (iOS 네이티브, SwiftUI)

기존 PWA(`toeic-rc`)의 단어 1,300개, 문법 8개 주제, 파트별 팁을 그대로 옮긴 SwiftUI 앱입니다.

## 요구 사항
- Mac + **Xcode 16 이상** (프로젝트가 Xcode 16의 폴더 동기화 방식을 씁니다)
- iOS 17 이상 아이폰

## 실행 방법
1. `ToeicApp.xcodeproj` 를 Xcode로 엽니다.
2. 왼쪽에서 ToeicApp 타깃 → **Signing & Capabilities** → Team 에 본인 Apple ID 를 선택합니다. (무료 Apple ID 도 됩니다)
   - Bundle Identifier 가 이미 쓰인다는 오류가 나면 `com.yoon021102.toeicapp` 끝에 아무 글자나 붙이세요.
3. 아이폰을 케이블로 연결하고 상단에서 기기를 고른 뒤 ▶︎ 실행.
4. 처음 한 번은 아이폰 **설정 → 일반 → VPN 및 기기 관리** 에서 개발자 앱을 신뢰해야 합니다. 아이폰에 **개발자 모드**를 켜라는 안내가 나오면 켜 주세요.

> 무료 Apple ID 로 설치한 앱은 7일 뒤 만료되어 다시 ▶︎ 실행해야 합니다. 유료 개발자 계정($99/년)이면 1년, TestFlight 배포도 가능합니다.

## 구조
```
ToeicApp/
  ToeicApp.swift          앱 진입점, 하단 탭 4개 (홈/단어/문법/팁)
  Models/Content.swift    JSON 콘텐츠 모델과 로딩, D-day 계산
  Models/ProgressStore.swift  학습 기록 (외운 단어, 오답 노트, 문법 정답) → UserDefaults
  Views/HomeView.swift    D-day, 오늘의 Day, 진도, 오답 노트
  Views/VocabViews.swift  Day 목록, 단어 목록, 플래시카드, 뜻 고르기 퀴즈
  Views/GrammarViews.swift 문법 설명, 예문, Part 5 형식 4지선다
  Views/TipsView.swift    파트별 풀이 팁, 기록 초기화
  Resources/*.json        단어/문법/팁 데이터
```

## 콘텐츠 추가
`Resources/vocab.json`, `grammar.json`, `tips.json` 에 같은 형식으로 항목을 넣으면 됩니다. 문법 텍스트의 `**굵게**` 는 굵은 글씨로 표시됩니다.

## Mac 없이 (Windows PC) 설치하기
1. GitHub 저장소의 **Actions → iOS build** 에서 최신 실행을 열고 `ToeicApp-unsigned-ipa` 를 내려받아 압축을 풉니다.
2. Windows 에 [Sideloadly](https://sideloadly.io) 와 iTunes(Apple 웹사이트 버전) 를 설치합니다.
3. 아이폰을 케이블로 연결하고 Sideloadly 에 `ToeicApp-unsigned.ipa` 를 끌어다 놓은 뒤, Apple ID 를 입력하고 Start.
4. 아이폰 **설정 → 일반 → VPN 및 기기 관리** 에서 앱을 신뢰하고, 안내가 나오면 **개발자 모드**를 켭니다.

무료 Apple ID 로는 7일마다 다시 설치해야 합니다.
