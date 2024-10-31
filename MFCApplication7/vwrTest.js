var getElement = function (id) {
    return document.getElementById(id);
};

//Webview2 설정


// 기본/구간 제어에 따른 UI 변경
// [params] controlType: 'basic' | 'section' => false: 기본 제어, true: 구간 제어
function setVWRControlType(controlType) {
    var progressEl = getElement("nf-vwr-metrics-progress");
    var waitTimeEl = getElement("nf-vwr-metrics-wait-time");
    var marquee = getElement("nf-vwr-marquee");

    if (controlType === "section") {
        if (progressEl) progressEl.style.display = "none";
        if (waitTimeEl) waitTimeEl.style.display = "none";
        if (marquee) marquee.style.display = "block";
    }
}

// 대기창 내부 값 변경
// [params] waitTime: string => 대기 시간, progressRate: number => 프로그래스 바, aheadCount: string | number => 내 앞의 대기자 수, behindCount: string | number => 내 뒤의 대기자 수
function setVWRMetrics(waitTime, progressRate, aheadCount, behindCount) {
    var waitTimeEl = getElement("nf-vwr-metrics-wait-time-value");
    var progressEl = getElement("nf-vwr-metrics-progress");
    var aheadCountEl = getElement("nf-vwr-metrics-ahead-count-value");
    var behindCountEl = getElement("nf-vwr-metrics-behind-count-value");

    if (waitTimeEl) waitTimeEl.innerText = waitTime;
    if (progressEl) progressEl.value = progressRate;
    if (aheadCountEl) aheadCountEl.innerText = aheadCount;
    if (behindCountEl) behindCountEl.innerText = behindCount;
}

// 접속 중 애니메이션으로 UI 변경
function setVWREntering() {
    var essentialEl = getElement("nf-vwr-metrics-essential");
    var marqueeEl = getElement("nf-vwr-marquee");
    var optionalEl = getElement("nf-vwr-metrics-optional");
    var enteringEl = getElement("nf-vwr-entering");
    var enteringMsgEl = getElement("nf-vwr-entering-message");

    if (essentialEl) essentialEl.style.display = "none";
    if (marqueeEl) marqueeEl.style.display = "none";
    if (optionalEl) optionalEl.style.display = "none";
    if (enteringEl) enteringEl.style.display = "block";
    if (enteringMsgEl) enteringMsgEl.style.display = "block";
}

// 취소 버튼 숨기기 (use case: dynamic agent인데, redirect url이 없는 경우)
function hideVWRCancel() {
    var cancelEl = getElement("nf-vwr-cancel");
    var errorActionEl = getElement("nf-vwr-error-action-btn");

    if (cancelEl) cancelEl.style.display = "none";
    if (errorActionEl) errorActionEl.style.display = "none";
}

// 대기 취소 버튼 클릭 이벤트 (각 agent 담당자가 관리)
document.addEventListener("DOMContentLoaded", function () {
    var cancelEl = getElement("nf-vwr-cancel");

    if (cancelEl) {
        cancelEl.onclick = function () {
            var cancelURL = cancelEl.dataset.nfCancelUrl;

            // Android에서 제공하는 인터페이스 호출
            Android.onCloseClicked(cancelURL);
        };
    }
});

var customCancelEl = document.getElementById("nf-vwr-cancel");
if (customCancelEl) {
    console.log(customCancelEl);
    customCancelEl.onclick = function () {
        window.alert('close button called');
        window.chrome.webview.postMessage("NF-VWR-CANCEL");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded Called in JS file");
    // window.alert("DOMContentLoaded Called in JS file");
});

// 시스템 에러 타입 전환
// [params] errorType: 'pageNotAccessible' | 'pageNotFound' | 'networkError' | 'unknownError' | 'anomalyDetection' => 에러 타입
function setVWRErrorType(errorType) {
    var navigatorLanguage = navigator.language || navigator.userLanguage;
    var browserLanguage = navigatorLanguage.split("-")[0];

    var language = "en";
    switch (browserLanguage) {
        case "ko":
            language = "ko";
            break;
        case "ja":
            language = "ja";
            break;
        case "en":
        default:
            language = "en";
    }

    var retryText = {
        ko: "다시 시도",
        en: "Try Again",
        ja: "再試行",
    };

    var closeText = {
        ko: "닫기",
        en: "Close",
        ja: "閉じる",
    };

    var contentText = {
        ko: {
            pageNotAccessible: {
                title: "페이지 접속 불가",
                desc1: "해당 페이지는 접근이 차단되었습니다.",
                desc2: "이용하시는 웹사이트에 문의해주세요.",
            },
            pageNotFound: {
                title: "페이지를 찾을 수 없습니다.",
                desc1: "찾을 수 없는 페이지입니다.",
                desc2: "요청하신 페이지가 사라졌거나, 잘못된 경로로 인해 사용하실 수 없습니다.",
            },
            networkError: {
                title: "네트워크 오류",
                desc1: "기기 혹은 통신 상의 네트워크 오류로 인해 대기가 중단 되었습니다.",
                desc2: "다시 대기를 시도하시려면 아래 버튼을 눌러주세요.",
            },
            unknownError: {
                title: "알 수 없는 오류",
                desc1: "알 수 없는 오류로 인해 대기가 중단되었습니다.",
                desc2: "다시 대기를 시도하시려면 아래 버튼을 눌러주세요.",
            },
            anomalyDetection: {
                title: "이상 활동 감지",
                desc1: "이상 활동이 감지되어 접근이 차단되었습니다.",
                desc2: "",
            },
        },
        en: {
            pageNotAccessible: {
                title: "Page Not Accessible",
                desc1: "Access to this page has been blocked.",
                desc2: "Please contact the website you are using.",
            },
            pageNotFound: {
                title: "Page Not Found",
                desc1: "The page you are looking for cannot be found.",
                desc2: "It might have been removed, or you might have used an incorrect URL.",
            },
            networkError: {
                title: "Network Error",
                desc1: "The waiting process was interrupted due to a network error with your device or communication.",
                desc2: "Please press the button below to try waiting again.",
            },
            unknownError: {
                title: "Unknown Error",
                desc1: "The waiting process was interrupted due to an unknown error.",
                desc2: "Please press the button below to try waiting again.",
            },
            anomalyDetection: {
                title: "Anomaly Detection",
                desc1: "Anomalous activity was detected and access was blocked.",
                desc2: "",
            },
        },
        ja: {
            pageNotAccessible: {
                title: "ページにアクセスできません。",
                desc1: "このページのアクセスはブロックされています。",
                desc2: "ご利用のウェブサイトにお問い合わせください。",
            },
            pageNotFound: {
                title: "ページにアクセスできません。",
                desc1: "このページのアクセスはブロックされています。",
                desc2: "ご利用のウェブサイトにお問い合わせください。",
            },
            networkError: {
                title: "ネットワークエラー",
                desc1: "お使いのデバイスまたは通信のネットワークエラーにより待機が中断されました。",
                desc2: "再度待機を試みるには以下のボタンを押してください。",
            },
            unknownError: {
                title: "不明なエラー",
                desc1: "不明なエラーにより待機が中断されました。",
                desc2: "再度待機を試みるには以下のボタンを押してください。",
            },
            anomalyDetection: {
                title: "異常な活動の検出",
                desc1: "異常な活動が検出され、アクセスがブロックされました。",
                desc2: "",
            },
        },
    };

    var titleEl = getElement("nf-vwr-error-title");
    var desc1El = getElement("nf-vwr-error-description-1");
    var desc2El = getElement("nf-vwr-error-description-2");
    var actionBtnEl = getElement("nf-vwr-error-action-btn");

    var isShowButton =
        errorType === "networkError" ||
        errorType === "unknownError" ||
        errorType === "anomalyDetection";

    if (titleEl) titleEl.innerText = contentText[language][errorType].title;
    if (desc1El) desc1El.innerText = contentText[language][errorType].desc1;
    if (desc2El) desc2El.innerText = contentText[language][errorType].desc2;
    if (actionBtnEl) {
        if (errorType === "anomalyDetection") {
            actionBtnEl.innerText = closeText[language];
        } else {
            actionBtnEl.innerText = retryText[language];
        }
        actionBtnEl.style.display = isShowButton ? "flex" : "none";
    }
}

// 네트워크 오류 페이지의 다시 시도 버튼에 이벤트 할당
document.addEventListener("DOMContentLoaded", function () {
    var errorActionEl = getElement("nf-vwr-error-action-btn");

    if (errorActionEl) {
        errorActionEl.onclick = function () {
            // Android에서 제공하는 인터페이스 호출
            Android.onCloseClicked();
        };
    }
});

// 사전 대기실 이벤트 시간 변경
function setEventTime(eventTime) {
    const eventTimeEl = getElement('nf-vwr-metrics-event-time');
    eventTimeEl.textContent = eventTime;
}

// 사전 대기실 시간 변경
// days: 01, hrs: 02, mins: 03, secs: 04
function setCountdown(days, hrs, mins, secs) {
    // 시간 value 표시
    var dayValueEl = getElement('nf-vwr-timer-day-value');
    var hourValueEl = getElement('nf-vwr-timer-hour-value');
    var minuteValueEl = getElement('nf-vwr-timer-minute-value');
    var secondValueEl = getElement('nf-vwr-timer-second-value');

    if (dayValueEl) dayValueEl.innerText = days;
    if (hourValueEl) hourValueEl.innerText = hrs;
    if (minuteValueEl) minuteValueEl.innerText = mins;
    if (secondValueEl) secondValueEl.innerText = secs;

    // 시간 텍스트 색 변경
    var activeColor = '#fafafa';
    var deActiveColor = '#d5d5d5';

    dayValueEl.style.color = activeColor;
    hourValueEl.style.color = activeColor;
    minuteValueEl.style.color = activeColor;
    secondValueEl.style.color = activeColor;

    if (days === '00') {
        dayValueEl.style.color = deActiveColor;

        if (hrs === '00') {
            hourValueEl.style.color = deActiveColor;

            if (mins === '00') {
                minuteValueEl.style.color = deActiveColor;
            }
        }
    }

    // 60초 이하일 경우, second 카드 색 변경
    var secondCardEl = getElement('nf-vwr-timer-card-second');
    secondCardEl.classList.toggle('unit-active', days == '00' && hrs == '00' && mins == '00');
}

//테스트용 - 제목 변경
function setTitle(title) {
    var titleEl = document.getElementsByClassName('nf-vwr-title')[0];
    titleEl.textContent = title;
}

window.setVWRControlType = setVWRControlType;
window.setVWRMetrics = setVWRMetrics;
window.setVWREntering = setVWREntering;
window.hideVWRCancel = hideVWRCancel;
window.setVWRErrorType = setVWRErrorType;
window.setEventTime = setEventTime;
window.setCountdown = setCountdown;
window.setTitle = setTitle;

console.log("script called");
// window.alert("script called");

