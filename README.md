# skip-ad

특정 사이트에서 동영상 재생 전 삽입되는 광고를 자동으로 건너뛰는 **Safari Web Extension** 프로젝트입니다. iOS와 macOS를 모두 지원합니다.

## 프로젝트 성격

- **타입**: Safari Web Extension (Manifest V3)
- **언어**: 확장 로직은 **JavaScript / HTML / CSS**, 호스트 앱은 Swift
- **배포**: App Store를 통한 호스트 앱 배포 → Safari에서 확장 활성화
- **호환성**: Safari 전용 (Chrome·Firefox·Edge 등에서는 동작하지 않음)

## 프로젝트 구조에 관하여

Xcode의 **"Safari Web Extension App"** 템플릿으로 생성된 기본 구조이며, iOS/macOS용 Safari 확장을 만들 때의 **표준 형태**입니다. 일반적인 Swift 앱 프로젝트와는 다릅니다.

핵심 포인트:

1. **Safari 확장은 호스트 앱 없이 단독 배포가 불가능** → `(App)` 타겟이 반드시 존재
2. **iOS와 macOS는 entitlements·Info.plist가 달라 타겟이 분리** → 공통 코드는 `Shared (App)` / `Shared (Extension)`에 배치
3. **실제 확장 동작은 JavaScript로 구현** → `Shared (Extension)/Resources/` 안의 JS·HTML·CSS가 본체
4. **Swift(`SafariWebExtensionHandler`)는 껍데기 역할** → JS ↔ 네이티브 브릿지가 필요할 때만 사용

## 동작 방식

1. 페이지 로드 시 0.5초마다 동영상 플레이어를 감시합니다.
2. 광고 대기 중에는 재생 속도를 **16배속**으로 올려 빠르게 소진시킵니다.
3. `.roll-skip-button.enabled` 스킵 버튼이 활성화되면 자동으로 클릭합니다.
4. 스킵 완료 후 재생 속도를 **1배속**으로 복구하고 감시를 종료합니다.
5. 예외 상황에 대비해 30초 이후에는 무조건 감시를 중단합니다 (메모리 누수 방지).

## 프로젝트 구조

```
skip-add/
├── iOS (App)              # iOS 호스트 앱 타겟 (Swift)
├── iOS (Extension)        # iOS 확장 타겟 (SafariWebExtensionHandler.swift)
├── macOS (App)            # macOS 호스트 앱 타겟 (Swift)
├── macOS (Extension)      # macOS 확장 타겟 (SafariWebExtensionHandler.swift)
├── Shared (App)           # iOS/macOS 공용 앱 리소스·Swift 코드
├── Shared (Extension)     # iOS/macOS 공용 확장 리소스 (실제 개발 영역)
│   └── Resources/
│       ├── manifest.json  # 확장 매니페스트 (MV3)
│       ├── content.js     # 광고 스킵 로직 — 본 프로젝트의 핵심
│       ├── background.js  # 백그라운드 서비스 워커
│       ├── popup.html     # 툴바 아이콘 팝업 UI
│       ├── popup.css
│       ├── popup.js
│       ├── images/        # 아이콘 리소스
│       └── _locales/      # 다국어 문자열
└── skip-add.xcodeproj
```

> 💡 이 템플릿은 Xcode → File → New → Project → **Safari Extension App** 선택 시 자동 생성되는 구조 그대로입니다. 대부분의 작업은 `Shared (Extension)/Resources/` 안에서 이루어지며 Swift 파일은 건드릴 일이 거의 없습니다.

## 빌드 및 실행

1. Xcode에서 `skip-add.xcodeproj`를 엽니다.
2. 실행할 스킴을 선택합니다.
   - iOS 테스트: `skip-add (iOS)`
   - macOS 테스트: `skip-add (macOS)`
3. 빌드 후 실행하면 호스트 앱이 열립니다.
4. Safari 설정에서 확장 프로그램을 활성화합니다.
   - **macOS**: Safari → 설정 → 확장 프로그램 → `skip-add` 체크
   - **iOS**: 설정 → Safari → 확장 프로그램 → `skip-add` 활성화

## 아이패드(iOS 기기)에 배포하기 (TestFlight)

Apple Developer Program 가입이 되어 있다면, App Store 정식 심사 없이 TestFlight 내부 테스트로 개인 기기에 바로 설치할 수 있습니다.

1. Xcode에서 `skip-add (iOS)` 스킴 선택 후 **Product → Archive**로 아카이브 생성
2. Organizer에서 **Distribute App → App Store Connect**로 업로드
3. [App Store Connect](https://appstoreconnect.apple.com)에서 해당 앱의 **TestFlight → 내부 테스터**에 본인 Apple ID 추가
4. 빌드 처리 완료 후, 아이패드의 **TestFlight 앱**에서 바로 설치 (심사 불필요, 몇 분~몇십 분 내 처리)

> ⚠️ 외부 테스터(공개 링크)로 배포할 경우에는 Beta App Review(간이 심사)를 거쳐야 하며 최초 빌드는 24~48시간 정도 소요될 수 있습니다.

## 대상 사이트 설정

대상 사이트는 더 이상 `manifest.json`에 고정되어 있지 않습니다. 툴바 아이콘을 눌러 팝업을 열고, 원하는 사이트 주소를 입력한 뒤 **추가** 버튼을 누르면 됩니다.

1. 팝업의 입력창에 사이트 도메인(예: `kr43.topgirl.co`)을 입력하고 **추가** 클릭
2. Safari가 해당 사이트에 대한 접근 권한을 요청하면 허용
3. 권한이 승인되면 `browser.storage.local`에 사이트가 저장되고, `background.js`가 `browser.scripting.registerContentScripts()`로 `content.js`를 해당 사이트에 동적 등록
4. 더 이상 사용하지 않는 사이트는 목록에서 **삭제** 버튼으로 제거 가능 (등록 해제 + 권한 반납)

재빌드 없이 앱 사용 중에 바로 사이트를 추가/삭제할 수 있습니다. 초기 설치 시에는 기존 호환을 위해 `kr43.topgirl.co`가 기본값으로 등록됩니다.

> ⚠️ `content.js`는 `#player_html5_api` 비디오 엘리먼트와 `.roll-skip-button.enabled` 스킵 버튼 셀렉터를 기준으로 동작합니다. 대상 사이트의 DOM 구조가 다르면 스크립트는 등록되어도 실제로는 동작하지 않으므로 셀렉터도 함께 수정해야 합니다.

## 요구 사항

- Xcode 15 이상
- macOS 13 이상 / iOS 16 이상 (권장)
- Safari 16 이상
