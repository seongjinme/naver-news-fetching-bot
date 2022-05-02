# 플랫폼별 Incoming Webhook 생성 가이드

## 슬랙(Slack)
[Slack용 수신 웹후크 - Slack Help Center](https://slack.com/intl/ko-kr/help/articles/115005265063-Slack%EC%9A%A9-%EC%88%98%EC%8B%A0-%EC%9B%B9%ED%9B%84%ED%81%AC) 문서를 참고하여 진행해주세요.

1. Slack에 로그인하신 상태에서 [새 Slack 앱을 생성](https://api.slack.com/apps?new_app=1)합니다. Create an app 팝업에서 `From scratch`를 선택하신 뒤, 원하시는 봇 이름과 뉴스를 전송할 워크스페이스를 선택하고 `Create App` 버튼을 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/slack_app_create.png" width="500" alt="Create new app in Slack Workspace"></p>
2. 앱 생성 완료 후 나타나는 Basic Information 화면에서 `Add features and functionality`를 누르면 나타나는 `Incoming Webhooks`를 선택한 뒤 `Activate Incoming Webhooks` 토글을 켜서 `On`으로 만듭니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/slack_webhook_toggle.png" width="500" alt="Activate incoming webhook"></p>
3. 같은 화면 하단의 `Add New Webhook to Workspace` 버튼을 누른 뒤, 뉴스를 전송할 Slack 채널 또는 사용자를 지정하고 `허용(Allow)` 버튼을 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/slack_webhook_create.png" width="500" alt="Add new webhook in Slack workspace"></p>
4. 다시 돌아온 화면의 하단에 표시된 `Webhook URL`을 복사하여 `Code.gs`의 `globalVariables()`에 위치한 설정값에 붙여넣습니다.

## 팀즈(Microsoft Teams)
1. PC에서 뉴스를 받아보실 팀 채널에 접속하신 상태로 우측 상단의 `...` 버튼을 누르신 뒤 `커넥터`를 선택합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/teams_connector.png" width="500" alt="Select 'Connector' in Teams channel"></p>
2. 커넥터 목록에서 `Incoming Webhook` 항목을 찾아 `추가`를 누르고, 상세 설명이 나오는 모달 화면에서 다시 `추가`를 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/teams_connector_webhook.png" alt="Add Incoming Webhook connector in Teams"></p>
3. 1번 과정을 다시 반복한 뒤, 커넥터 목록에서 `Incoming Webhook` 항목의 `구성`을 누릅니다.
4. 뉴스봇의 이름과 프로필 사진을 정하신 뒤 `만들기` 버튼을 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/teams_webhook_create.png" alt="Add new incoming webhook in Teams"></p>
5. 생성된 `Webhook URL`을 복사하여 `Code.gs`의 `globalVariables()`에 위치한 설정값에 붙여넣습니다.

## 잔디(JANDI)
1. PC로 잔디에 로그인하신 상태에서 우측 최상단 버튼을 누르고 `잔디 커넥트`로 이동합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/jandi_connect.png" width="500" alt="Select 'Connector' in JANDI"></p>
2. 연동 서비스 목록 가운데 `Webhook 수신 (Incoming Webhook)`의 `연동 항목 추가하기`를 누릅니다.
3. 뉴스를 받아보실 토픽이나 1:1 메시지를 선택하시고, 뉴스봇의 이름과 프로필 사진을 정하신 뒤 `연동 항목 추가하기`를 누릅니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/jandi_webhook.png" alt="Add new incoming webhook in JANDI"></p>
4. 생성된 `Webhook URL`을 복사하여 `Code.gs`의 `globalVariables()`에 위치한 설정값에 붙여넣습니다.

## 구글챗(Google Chat)
구글챗(Google Chat)의 경우 구글 워크스페이스(Google Workspace)에 유료 가입된 조직의 구성원만 Webhook 생성이 가능합니다. 이에 대한 자세한 설명은 구글 측에서 제공하는 [Google Chat 계정 유형의 차이점 알아보기](https://support.google.com/chat/answer/9291345?hl=ko)와 [사용자가 봇을 설치하도록 허용하기](https://support.google.com/a/answer/7651360?hl=ko) 문서를 참고해주시기 바랍니다.

1. 봇을 추가할 Google Chat 대화방(Space)에 PC로 접속한 뒤 아래 사진과 같이 “웹훅 보기”를 선택합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/manage_webhook.png" alt="Manage webhooks in Google Chat"></p>
2. 새로 추가할 Webhook의 이름과 프로필 사진 URL(선택사항)을 입력합니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_webhook.png" width="500" alt="Add new webhook in Google Chat"></p>
3. 새로 생성된 Webhook의 URL을 복사하여 `Code.gs`의 `globalVariables()`에 위치한 설정값에 붙여넣습니다.<p><img src="https://github.com/seongjinme/naver-news-fetching-bot/blob/main/static/images/add_webhook_result.png" width="500" alt="Copy URL of new webhook in Google Chat"></p>
