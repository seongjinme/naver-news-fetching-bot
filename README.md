# Naver News Fetching Bot

Naver News Fetching Bot 은 Google Workspace 기반 업무 환경에서 네이버 뉴스 모니터링과 아카이빙을 자동화하는 도구입니다. Slack, Jandi 등의 협업툴에서 제공하는 RSS 피드 연동 기능보다 조금 더 발전된 형태의 기능을 제공합니다.

* 원하는 키워드가 포함된 최신 네이버 뉴스 항목을 Google Chat의 팀 공용 Space에 자동으로 공유합니다.
* 공유된 뉴스 항목을 Google Sheets 문서에 자동으로 아카이빙 합니다. 이 기능은 필요에 따라 켜고 끌 수 있습니다.
* Google Apps Script의 트리거 기능으로 갱신 주기를 자유롭게 정할 수 있습니다.

### Screenshot

<img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/chat_item_card.jpg" width="400" alt="Example image">

## Requirements

* Google Workspace 이용 환경
* Google Chat의 대화방 내 Webhook 생성 가능한 계정 권한 (* 권한이 없을 경우 봇 추가가 불가능합니다.)

### 참고자료

* [Google Chat 계정 유형의 차이점 알아보기 - Google Chat 고객센터](https://support.google.com/chat/answer/9291345?hl=ko)
* [사용자가 봇을 설치하도록 허용하기 - Google Workspace 관리자 고객센터](https://support.google.com/a/answer/7651360?hl=ko)

## Installation
### 1. Google Chat에서 Webhook 생성

1. 봇을 추가할 Google Chat 대화방(Space)에 PC로 접속한 뒤 아래 사진과 같이 “웹훅 보기”를 선택합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/manage_webhook.png" alt="Manage webhooks in Google Chat"></p>
2. 새로 추가할 Webhook의 이름과 프로필 사진 URL(선택사항)을 입력합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_webhook.png" alt="Add new webhook in Google Chat"></p>
3. 새로 생성된 Webhook의 URL을 복사, 메모합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_webhook_result.png" alt="Copy URL of new webhook in Google Chat"></p>

### 2. Google Apps Script에서 스크립트 삽입 및 API 추가

1. [Google Apps Script](https://script.google.com) 에서 새 프로젝트를 생성합니다.
2. 생성된 프로젝트에 포함된 <code>Code.gs</code> 에 Repo의 [/Code.gs](https://github.com/seongjinme/naver-news-fetching-bot/blob/main/Code.gs) 파일 내용을 붙여넣습니다.
3. 좌측 화면에서 “서비스” 항목의 우측 “+” 버튼을 누르고, API 추가 팝업 화면에서 <code>“Google Sheets API”</code>를 찾아 선택 후 추가합니다. 이때 식별자 이름은 기본값인 <code>“Sheets”</code>를 유지합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_sheets_api.png" alt="Add Google Sheets API to the project"></p>

### 3. <code>globalVariales()</code> 내 주요 설정값 삽입
1번은 디버그 모드, 2-4번은 모니터링 기능, 5-8번은 아카이빙 기능 관련 설정값입니다. true/false로 나뉘는 항목들 외에는 해당 설정값들이 반드시 겹 따옴표(“”) 안에 위치해야 합니다. 이때 대괄호(“[]”)는 지우고 넣어주세요.

<img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/set_variables.png" alt="Set global variables">

1. <code>DEBUG</code> : 디버그 모드를 설정합니다. (true/false, 기본값: false)
2. <code>keyword</code> : 모니터링할 검색어를 입력합니다.
3. <code>webhook</code> : 위에서 생성한 Webhook의 URL을 그대로 입력합니다.
4. <code>card</code> : 대화방에 전송될 뉴스 항목을 카드 형태로 전송할지 여부를 결정합니다. (true/false, 기본값: true)
5. <code>allowArchiving</code> : 대화방에 전송된 뉴스 항목을 Google Sheets 문서로 아카이빙할지 결정합니다. (true/false, 기본값: true)
6. <code>spreadsheetId</code> : 뉴스 항목을 아카이빙할 Google Sheets 문서의 ID값을 입력합니다. (*)
7. <code>sheetName</code> : 뉴스 항목을 아카이빙할 6번 문서의 해당 시트 이름을 입력합니다. (*)
8. <code>sheetTargetCell</code> : 뉴스 항목이 업데이트될 셀 영역의 좌상단 첫 번째 셀 경로를 입력합니다. 제목행 다음 줄의 첫 번째 셀 주소에 해당됩니다. (*)

(* 5번이 false일 경우 6~8번은 비워두셔도 무방합니다.)

### 4. 스크립트 최초 실행 및 권한 부여

1. Google Apps Script 화면 상단에서 아래 사진과 같은 영역을 확인 후, 함수명을 <code>“getArticle”</code>로 선택 후 “실행”을 클릭합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/run.png" alt="Run getArticle()"></p>
2. 아래와 같이 권한 인증 팝업이 뜹니다. “권한 검토”를 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/auth_popup_required.png" alt="Review auth popup"></p>
3. 앞서 진행한 Google Chat과 Sheets 관련 액세스 허용 팝업이 뜹니다. “허용”을 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/auth_popup_allow.png" alt="Allow authentication"></p>
4. Google Apps Script 화면 하단의 “실행 로그” 영역에 “초기 설정이 완료되었습니다. 다음 실행 때부터 지금 시각 이후에 게재된 최신 뉴스를 가져옵니다.” 라는 문구가 뜨면 정상적으로 설정이 완료된 것입니다.
5. 이제 앞으로 이 스크립트가 실행될 때마다, 설정하신 키워드가 담긴 최신 네이버 뉴스 항목이 Google Chat 대화방과 Google Sheets 문서에 자동으로 올라가게 됩니다.

(* 이 Apps Script 프로젝트는 별도의 배포(Deploy) 과정이 필요하지 않습니다.)

### 5. 자동 갱신 트리거 설정

1. Google Apps Script 화면 좌측에서 시계 모양의 아이콘(트리거)을 클릭한 후, 새 트리거를 추가합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_trigger.png" alt="Add new trigger"></p>
2. 실행할 함수를 <code>“getArticle”</code>로 지정한 뒤, 원하시는 시간 간격을 설정합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_trigger_popup.png" alt="Set new trigger to refresh news items"></p>
3. 이제 지정된 시간 간격마다 새로 업데이트 되는 뉴스 항목들을 보실 수 있습니다.

## License
Naver News Fetching Bot은 MIT License를 따릅니다.
