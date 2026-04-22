console.log("Ad Skipper Extension Loaded!");

let observerInterval;

const autoSkipAd = () => {
    const video = document.getElementById('player_html5_api');
    
    // 1. 활성화된 스킵 버튼 찾기 (클래스 2개 동시 조건)
    const skipButton = document.querySelector('.roll-skip-button.enabled');
    
    if (skipButton) {
        // 스킵 버튼이 나타났으므로 클릭
        skipButton.click();
        console.log("Skip button clicked!");
        
        // 2. 동영상 속도 정상(1배속) 복구
        if (video) {
            video.playbackRate = 1.0;
        }
        
        // 3. 목적 달성 후 반복 체크 즉시 종료 (본 영상에 간섭하지 않도록)
        clearInterval(observerInterval);
        
    } else {
        // 스킵 버튼이 아직 없다면 (광고 대기 중) 16배속으로 빠르게 넘기기
        if (video && video.playbackRate !== 16.0) {
            video.playbackRate = 16.0;
        }
    }
};

// 동영상 플레이어나 버튼이 비동기적으로 로딩될 수 있으므로 0.5초마다 체크
observerInterval = setInterval(autoSkipAd, 500);

// 메모리 누수 방지 및 예외 상황을 위해 30초 후에는 무조건 체크 종료
setTimeout(() => {
    clearInterval(observerInterval);
    console.log("Ad Skipper stopped watching.");
}, 30000);
