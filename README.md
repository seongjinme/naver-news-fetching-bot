# Naver News Fetching Bot (네이버 뉴스 봇)

"Naver News Fetching Bot"은 원하는 검색어가 포함된 최신 네이버 뉴스를 슬랙(Slack), 팀즈(Microsoft Teams), 잔디(Jandi) 또는 구글챗(Google Chat)으로 전송하는 Google Apps Script 기반 서버리스 뉴스봇입니다. 네이버 오픈 API와 Google Apps Script의 트리거 기능, 그리고 Google의 Sheets API를 이용하여 네이버 뉴스의 실시간 모니터링 및 아카이빙 업무를 자동화 합니다.

* 원하는 키워드가 포함된 최신 네이버 뉴스를 공용 채팅방에 자동으로 전송합니다.
* 공유된 뉴스 항목을 Google Sheets 문서에 자동으로 아카이빙 합니다. 이 기능은 필요에 따라 켜고 끌 수 있습니다.
* Google Apps Script의 트리거 기능으로 갱신 주기를 자유롭게 정할 수 있습니다.

### 문서 목차
* [Update Notes](https://github.com/seongjinme/naver-news-fetching-bot/#update-notes)
* [Requirements](https://github.com/seongjinme/naver-news-fetching-bot/#requirements)
* [Installation](https://github.com/seongjinme/naver-news-fetching-bot/#installation)
* [License](https://github.com/seongjinme/naver-news-fetching-bot/#license)

### Screenshot
#### PC (Teams)
<img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/screenshot_pc_teams.gif" alt="Screenshot (PC, Teams)">

#### Mobile
<img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/screenshot_mobile.jpg" alt="Screenshot (Mobile)">

## Update Notes
### Ver 2.2.0 (2022-05-02)
* **마이크로소프트 팀즈(Microsoft Teams), 잔디(JANDI) 지원이 추가되었습니다.**
* 매체명 데이터(`source.gs`)가 업데이트 되었습니다. 2022년 5월 기준 총 731개의 매체 정보가 포함되었습니다.
* 매체명 탐색 속도가 개선되었습니다.

보다 자세한 업데이트 내용은 [/CHANGELOG.md](https://github.com/seongjinme/naver-news-fetching-bot/CHANGELOG.md)에서 확인하실 수 있습니다.

## Installation
### 1. Webhook 생성

뉴스를 받아보실 채팅 플랫폼에서 이용할 Incoming Webhook을 생성하신 뒤 해당 URL을 `Code.gs`의 `globalVariables()`에 위치한 설정값에 붙여넣으셔야 합니다. 플랫폼별 상세 방법은 아래 링크를 통해 확인해주세요.

* 슬랙(Slack)
* 팀즈(Microsoft Teams)
* 잔디(JANDI)
* 구글챗(Google Chat)

### 2. 네이버 개발자 센터에서 API용 Client ID, Secret 생성

1. [네이버측 공식 가이드 문서](https://developers.naver.com/docs/common/openapiguide/appregister.md)를 참고하여 [이 페이지](https://developers.naver.com/apps/#/wizard/register)에서 애플리케이션 등록 절차를 진행합니다.
2. [애플리케이션 등록 세부 정보 입력 단계](https://developers.naver.com/docs/common/openapiguide/appregister.md#%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98-%EB%93%B1%EB%A1%9D-%EC%84%B8%EB%B6%80-%EC%A0%95%EB%B3%B4)에서 다음과 같이 입력합니다.
- `애플리케이션 이름` : 임의로 입력합니다.
- `사용 API` : `검색`을 선택합니다.
- `로그인 오픈 API 서비스 환경` : `naver.com`을 입력합니다.
3. 애플리케이션 등록이 완료되면, [해당 애플리케이션 정보 화면](https://developers.naver.com/docs/common/openapiguide/appregister.md#%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98-%EB%93%B1%EB%A1%9D-%ED%99%95%EC%9D%B8)에 나타나는 Client ID와 Secret값을 복사하여 `Code.gs`의 설정값에 붙여넣습니다.

### 3. Google Apps Script에서 스크립트 삽입 및 API 추가

1. [Google Apps Script](https://script.google.com) 에서 새 프로젝트를 생성합니다.
2. 생성된 프로젝트에 포함된 <code>Code.gs</code> 에 Repo의 [/Code.gs](https://github.com/seongjinme/naver-news-fetching-bot/blob/main/Code.gs) 파일 내용을 붙여넣습니다.
3. 프로젝트에 새 파일로 `source.gs`와 `template.gs`를 추가하고 각 파일에 Repo의 [/source.gs](https://github.com/seongjinme/naver-news-fetching-bot/blob/main/source.gs)와 [/template.gs](https://github.com/seongjinme/naver-news-fetching-bot/blob/main/template.gs) 파일 내용을 붙여넣습니다.
4. 좌측 화면에서 “서비스” 항목의 우측 “+” 버튼을 누르고, API 추가 팝업 화면에서 <code>“Google Sheets API”</code>를 찾아 선택 후 추가합니다. 이때 식별자 이름은 기본값인 <code>“Sheets”</code>를 유지합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_sheets_api.png" width="500" alt="Add Google Sheets API to the project"></p>

### 4. <code>Code.gs</code>의 <code>globalVariables()</code>에 주요 설정값 삽입
각 설정값들에 대한 설명은 [/Code.gs](https://github.com/seongjinme/naver-news-fetching-bot/blob/main/Code.gs)에서 확인하실 수 있습니다. 아래 유의사항을 참고하여 삽입해주세요.

* `allow` 접두어가 붙은 항목들 중 필요하신 기능만 `true`로 바꿔주세요. 이들 중 최소한 하나 이상은 반드시 `true`로 설정되어야 정상 구동됩니다.
* `allow` 접두어가 붙은 항목들 중 `false`로 설정된 항목에 대해서는 `webhook` URL이나 `sheet` 정보는 비워두셔도 무방합니다.
* `true` 또는 `false`로 입력하는 경우가 아니면, 삽입하신 설정값 앞뒤로 쌍따옴표(`""`)가 반드시 붙어야 합니다. 이때 대괄호(`[]`)는 지우고 넣어주세요.
* 마지막 항목(`sheetTargetCell`) 외에는 모든 설정값 끝에 쉼표(`,`)가 반드시 필요합니다.

### 5. 스크립트 최초 실행 및 권한 부여

1. Google Apps Script 화면 상단에서 아래 사진과 같은 영역을 확인 후, 함수명을 <code>“runFetchingBot”</code>로 선택 후 “실행”을 클릭합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/run_v2.0.png" width="500" alt="Run runFetchingBot()"></p>
2. 아래와 같이 권한 인증 팝업이 뜹니다. “권한 검토”를 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/auth_popup_required.png" width="500" alt="Review auth popup"></p>
3. 앞서 진행한 Google Chat과 Sheets 관련 액세스 허용 팝업이 뜹니다. “허용”을 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/auth_popup_allow.png" width="500" alt="Allow authentication"></p>
4. Slack 등 Google 외부의 서비스와 처음 연동할 때엔 경우에 따라 "인증되지 않은 앱" 관련 경고 팝업이 뜨기도 합니다. 이때엔 좌측 하단의 `Advanced`를 누른 뒤 화면 하단의 `Go to [앱 URL] (Unsafe)` 링크를 눌러주시면 됩니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/auth_popup_isnt_verified.png" width="500" alt="Allow authentication"></p>
5. Google Apps Script 화면 하단의 “실행 로그” 영역에 “초기 설정이 완료되었습니다. 다음 실행 때부터 지금 시각 이후에 게재된 최신 뉴스를 가져옵니다.” 라는 문구가 뜨면 정상적으로 설정이 완료된 것입니다.
6. 이제 앞으로 이 스크립트가 실행될 때마다, 설정하신 키워드가 담긴 최신 네이버 뉴스 항목이 자동으로 전송됩니다.

(* 이 Apps Script 프로젝트는 별도의 배포(Deploy) 과정이 필요하지 않습니다.)

### 6. 자동 갱신 트리거 설정

1. Google Apps Script 화면 좌측에서 시계 모양의 아이콘(트리거)을 클릭한 후, 새 트리거를 추가합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_trigger.png" width="500" alt="Add new trigger"></p>
2. 실행할 함수를 <code>“runFetchingBot”</code>로 지정한 뒤, 원하시는 시간 간격을 설정합니다.
3. 이제 지정된 시간 간격마다 새로 업데이트 되는 뉴스 항목들을 보실 수 있습니다.

## License
Naver News Fetching Bot은 MIT License를 따릅니다.
