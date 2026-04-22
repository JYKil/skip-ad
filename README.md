# skip-add

특정 사이트에서 동영상 재생 전 삽입되는 광고를 자동으로 건너뛰는 Safari 웹 확장 프로그램입니다. iOS와 macOS를 모두 지원합니다.

## 동작 방식

1. 페이지 로드 시 0.5초마다 동영상 플레이어를 감시합니다.
2. 광고 대기 중에는 재생 속도를 **16배속**으로 올려 빠르게 소진시킵니다.
3. `.roll-skip-button.enabled` 스킵 버튼이 활성화되면 자동으로 클릭합니다.
4. 스킵 완료 후 재생 속도를 **1배속**으로 복구하고 감시를 종료합니다.
5. 예외 상황에 대비해 30초 이후에는 무조건 감시를 중단합니다 (메모리 누수 방지).

## 프로젝트 구조

```
skip-add/
├── iOS (App)              # iOS 호스트 앱
├── iOS (Extension)        # iOS 확장 타겟
├── macOS (App)            # macOS 호스트 앱
├── macOS (Extension)      # macOS 확장 타겟
├── Shared (App)           # iOS/macOS 공용 앱 리소스
├── Shared (Extension)     # iOS/macOS 공용 확장 리소스
│   └── Resources/
│       ├── manifest.json  # 확장 매니페스트 (MV3)
│       ├── content.js     # 광고 스킵 로직
│       ├── background.js
│       ├── popup.html
│       ├── popup.css
│       └── popup.js
└── skip-add.xcodeproj
```

## 빌드 및 실행

1. Xcode에서 `skip-add.xcodeproj`를 엽니다.
2. 실행할 스킴을 선택합니다.
   - iOS 테스트: `skip-add (iOS)`
   - macOS 테스트: `skip-add (macOS)`
3. 빌드 후 실행하면 호스트 앱이 열립니다.
4. Safari 설정에서 확장 프로그램을 활성화합니다.
   - **macOS**: Safari → 설정 → 확장 프로그램 → `skip-add` 체크
   - **iOS**: 설정 → Safari → 확장 프로그램 → `skip-add` 활성화

## 대상 사이트 설정

기본 매니페스트는 프라이버시를 위해 `*://example.com/*` 플레이스홀더로 설정되어 있습니다. 실제로 사용하려면 `Shared (Extension)/Resources/manifest.json`의 `content_scripts.matches` 값을 본인이 원하는 사이트 패턴으로 교체한 뒤 다시 빌드하세요.

```json
"content_scripts": [{
    "js": [ "content.js" ],
    "matches": [ "*://your-target-site.com/*" ]
}]
```

> ⚠️ `content.js`는 `#player_html5_api` 비디오 엘리먼트와 `.roll-skip-button.enabled` 스킵 버튼 셀렉터를 기준으로 동작합니다. 대상 사이트의 DOM 구조가 다르다면 셀렉터도 함께 수정해야 합니다.

## 요구 사항

- Xcode 15 이상
- macOS 13 이상 / iOS 16 이상 (권장)
- Safari 16 이상
