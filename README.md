# Naver News Fetching Bot (네이버 뉴스 봇)

Naver News Fetching Bot 은 Webhook을 이용하여 네이버 뉴스 모니터링과 아카이빙을 자동화하는 도구입니다. 네이버 오픈 API와 Google Apps Script의 트리거 기능을 이용하여 원하는 키워드가 포함된 최신 뉴스를 Google Chat Space, Slack에 주기적으로 전송합니다.

* 원하는 키워드가 포함된 최신 네이버 뉴스 항목을 Google Chat의 팀 공용 Space 또는 Slack의 특정 채널에 자동으로 공유합니다.
* 공유된 뉴스 항목을 Google Sheets 문서에 자동으로 아카이빙 합니다. 이 기능은 필요에 따라 켜고 끌 수 있습니다.
* Google Apps Script의 트리거 기능으로 갱신 주기를 자유롭게 정할 수 있습니다.

### 문서 목차
* [Update Notes](https://github.com/seongjinme/naver-news-fetching-bot/#update-notes)
* [Requirements](https://github.com/seongjinme/naver-news-fetching-bot/#requirements)
* [Installation](https://github.com/seongjinme/naver-news-fetching-bot/#installation)
* [License](https://github.com/seongjinme/naver-news-fetching-bot/#license)

### Screenshot

<img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/chat_item_card_v2.1_google.jpg" width="400" alt="Example image (Google Chat)">
<img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/chat_item_card_v2.1_slack.jpg" width="400" alt="Example image (Slack)">

## Update Notes
### Ver 2.1 (2022-03-25)
* **이제 Slack에서도 네이버 뉴스를 받아보실 수 있습니다.**
  - Slack Workspace에 생성하신 Webhook URL을 설정값에 추가해주시면 됩니다.
* 매체명 데이터 필드가 다시 추가되었습니다.
  - 뉴스 항목의 원본 URL을 `source.gs`와 비교 체크하여 매체명을 표기합니다. 
  - `source.gs`에는 2022년 3월 기준 약 5만 건의 최신 뉴스 데이터에 기반한 매체명 리스트가 있습니다.
  - `source.gs`에 수록되지 않은 매체의 경우 매체명이 `(알수없음)`으로 표기됩니다. 이 경우 데이터를 직접 추가해주시면 됩니다.
* 일부 불필요한 기능이 제거되었습니다. (예: Google Chat 전송 포맷 설정 등)

### Ver 2.0 (2022-03-20)
* 네이버 뉴스의 RSS Feed 지원 중단에 대응하여 뉴스봇 구동 기반을 네이버 오픈 API로 대체했습니다.
  - 따라서 네이버 오픈 API 이용에 필요한 Client ID, Secret 정보를 추가로 입력해주셔야 합니다.
  - 해당 정보의 획득 방법은 [네이버의 공식 문서](https://developers.naver.com/docs/common/openapiguide/appregister.md)를 참고해주세요.
* 네이버 오픈 API의 기능상 제한점으로 인해 일부 데이터 필드(매체명, 카테고리, 썸네일)가 더이상 지원되지 않습니다.
* API 응답 코드가 정상(200)인 경우에만 뉴스봇 기능이 구동되도록 예외 처리 부분이 추가되었습니다.
* 제목과 본문 데이터 필드에 포함된 불필요한 HTML Tag 및 Entity들이 필터링되도록 했습니다.

### Ver 1.0 (2021-10-18)
* RSS Feed에 기반한 최초 배포 버전입니다.

## Requirements

* Google Workspace 또는 Slack 이용 환경
  - * Google Workspace의 경우 Google Chat의 대화방 내 Webhook 생성 가능한 계정 권한 (* 권한이 없을 경우 봇 추가가 불가능합니다.)

### 참고자료

* [Google Chat 계정 유형의 차이점 알아보기 - Google Chat 고객센터](https://support.google.com/chat/answer/9291345?hl=ko)
* [사용자가 봇을 설치하도록 허용하기 - Google Workspace 관리자 고객센터](https://support.google.com/a/answer/7651360?hl=ko)
* [Slack용 수신 웹후크 - Slack Help Center](https://slack.com/intl/ko-kr/help/articles/115005265063-Slack%EC%9A%A9-%EC%88%98%EC%8B%A0-%EC%9B%B9%ED%9B%84%ED%81%AC)

## Installation
### 1. Webhook 생성

#### 1-1. Google Chat
1. 봇을 추가할 Google Chat 대화방(Space)에 PC로 접속한 뒤 아래 사진과 같이 “웹훅 보기”를 선택합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/manage_webhook.png" alt="Manage webhooks in Google Chat"></p>
2. 새로 추가할 Webhook의 이름과 프로필 사진 URL(선택사항)을 입력합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_webhook.png" alt="Add new webhook in Google Chat"></p>
3. 새로 생성된 Webhook의 URL을 복사하여 `Code.gs`의 설정값에 붙여넣습니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_webhook_result.png" alt="Copy URL of new webhook in Google Chat"></p>

#### 1-2. Slack
[Slack용 수신 웹후크 - Slack Help Center](https://slack.com/intl/ko-kr/help/articles/115005265063-Slack%EC%9A%A9-%EC%88%98%EC%8B%A0-%EC%9B%B9%ED%9B%84%ED%81%AC) 문서를 참고하여 진행해주세요.

1. Slack에 로그인하신 상태에서 [새 Slack 앱을 생성](https://api.slack.com/apps?new_app=1)합니다. Create an app 팝업에서 `From scratch`를 선택하신 뒤, 원하시는 봇 이름과 뉴스를 전송할 워크스페이스를 선택한 뒤 `Create App` 버튼을 누릅니다.
2. 앱 생성 완료 후 나타나는 Basic Information 화면에서 `Add features and functionality`를 누르면 나타나는 `Incoming Webhooks`를 선택한 뒤 `Activate Incoming Webhooks` 토글을 켭니다.
3. 같은 화면 하단의 `Add New Webhook to Workspace` 버튼을 누른 뒤, 뉴스를 전송할 Slack 채널 또는 사용자를 지정하고 `허용(Allow)` 버튼을 누릅니다.
4. 다시 돌아온 화면의 하단에 표시된 `Webhook URL`을 복사하여 `Code.gs`의 설정값에 붙여넣습니다.

### 2. 네이버 개발자 센터에서 API용 Client ID, Secret 생성

1. [네이버측 공식 가이드 문서](https://developers.naver.com/docs/common/openapiguide/appregister.md)를 참고하여 [이 페이지](https://developers.naver.com/apps/#/wizard/register)에서 애플리케이션 등록 절차를 진행합니다.
2. [애플리케이션 등록 세부 정보 입력 단계](https://developers.naver.com/docs/common/openapiguide/appregister.md#%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98-%EB%93%B1%EB%A1%9D-%EC%84%B8%EB%B6%80-%EC%A0%95%EB%B3%B4)에서 다음과 같이 입력합니다.
- 애플리케이션 이름 : 임의로 입력합니다.
- 사용 API : "검색"을 선택합니다.
- 로그인 오픈 API 서비스 환경 : "naver.com"을 입력합니다.
3. 애플리케이션 등록이 완료되면, [해당 애플리케이션 정보 화면](https://developers.naver.com/docs/common/openapiguide/appregister.md#%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98-%EB%93%B1%EB%A1%9D-%ED%99%95%EC%9D%B8)에 나타나는 Client ID와 Secret값을 체크합니다.

### 3. Google Apps Script에서 스크립트 삽입 및 API 추가

1. [Google Apps Script](https://script.google.com) 에서 새 프로젝트를 생성합니다.
2. 생성된 프로젝트에 포함된 <code>Code.gs</code> 에 Repo의 [/Code.gs](https://github.com/seongjinme/naver-news-fetching-bot/blob/main/Code.gs) 파일 내용을 붙여넣습니다.
3. 프로젝트에 새 파일 `source.gs`를 추가하고 Repo의 [/source.gs](https://github.com/seongjinme/naver-news-fetching-bot/blob/main/source.gs) 파일 내용을 붙여넣습니다.
4. 좌측 화면에서 “서비스” 항목의 우측 “+” 버튼을 누르고, API 추가 팝업 화면에서 <code>“Google Sheets API”</code>를 찾아 선택 후 추가합니다. 이때 식별자 이름은 기본값인 <code>“Sheets”</code>를 유지합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_sheets_api.png" alt="Add Google Sheets API to the project"></p>

### 4. <code>globalVariales()</code> 내 주요 설정값 삽입
설정값이 `true` 또는 `false`로 지정된 항목들 외에는 해당 설정값들이 반드시 겹 따옴표(“”) 안에 위치해야 합니다. 이때 대괄호(“[]”)는 지우고 넣어주세요.

1. <code>DEBUG</code> : 디버그 모드 ON/OFF (true/false로만 입력, 기본값: false)

2. <code>clientId</code> : 네이버 검색 오픈 API 접근 가능한 Client ID 값
3. <code>clientSecret</code> : 네이버 검색 오픈 API 접근 가능한 Client Secret 값

4. <code>keyword</code> : 모니터링할 네이버뉴스 검색어

5. <code>allowBotGoogle</code> : 뉴스 항목의 Google Chat Space 전송 여부 (true/false로만 입력)
6. <code>webhookGoogle</code> : Google Chat Space 공간에 설정된 웹훅(Webhook) URL (5번이 false일 경우 비워두어도 무방)

7. <code>allowBotSlack</code> : 뉴스 항목의 Slack 전송 여부 (true/false로만 입력)
8. <code>webhookSlack</code> : Slack Workspace 공간에 설정된 웹훅(Webhook) URL (7번이 false일 경우 비워두어도 무방)

9. <code>allowArchiving</code> : 뉴스 항목의 구글 시트 저장 여부 (true/false로만 입력, 기본값: true)
10. <code>spreadsheetId</code> : 뉴스 항목을 저장할 구글 시트 문서 ID값 (*)
11. <code>sheetName</code> : 뉴스 항목을 저장할 구글 시트 문서의 해당 시트 이름 (*)
12. <code>sheetTargetCell</code> : 뉴스 항목을 저장할 구글 시트 셀 영역의 좌상단 첫 번째 셀 경로 (제목행 다음줄의 첫 번째 셀) (*)

(* 9번이 false일 경우 10~12번은 비워두셔도 무방합니다.)

### 5. 스크립트 최초 실행 및 권한 부여

1. Google Apps Script 화면 상단에서 아래 사진과 같은 영역을 확인 후, 함수명을 <code>“runFetchingBot”</code>로 선택 후 “실행”을 클릭합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/run_v2.0.png" alt="Run runFetchingBot()"></p>
2. 아래와 같이 권한 인증 팝업이 뜹니다. “권한 검토”를 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/auth_popup_required.png" alt="Review auth popup"></p>
3. 앞서 진행한 Google Chat과 Sheets 관련 액세스 허용 팝업이 뜹니다. “허용”을 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/auth_popup_allow.png" alt="Allow authentication"></p>
4. Slack 등 Google 외부의 서비스와 처음 연동할 때엔 경우에 따라 "인증되지 않은 앱" 관련 경고 팝업이 뜨기도 합니다. 이때엔 좌측 하단의 `Advanced`를 누른 뒤 화면 하단의 `Go to [앱 URL] (Unsafe)` 링크를 눌러주시면 됩니다.
5. Google Apps Script 화면 하단의 “실행 로그” 영역에 “초기 설정이 완료되었습니다. 다음 실행 때부터 지금 시각 이후에 게재된 최신 뉴스를 가져옵니다.” 라는 문구가 뜨면 정상적으로 설정이 완료된 것입니다.
6. 이제 앞으로 이 스크립트가 실행될 때마다, 설정하신 키워드가 담긴 최신 네이버 뉴스 항목이 Google Chat 대화방과 Google Sheets 문서에 자동으로 올라가게 됩니다.

(* 이 Apps Script 프로젝트는 별도의 배포(Deploy) 과정이 필요하지 않습니다.)

### 6. 자동 갱신 트리거 설정

1. Google Apps Script 화면 좌측에서 시계 모양의 아이콘(트리거)을 클릭한 후, 새 트리거를 추가합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_trigger.png" alt="Add new trigger"></p>
2. 실행할 함수를 <code>“runFetchingBot”</code>로 지정한 뒤, 원하시는 시간 간격을 설정합니다.
3. 이제 지정된 시간 간격마다 새로 업데이트 되는 뉴스 항목들을 보실 수 있습니다.

## License
Naver News Fetching Bot은 MIT License를 따릅니다.
