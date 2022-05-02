/*************************************************************************************************
 * Naver News Fetching Bot: template.gs
 * ***********************************************************************************************
 * 네이버 뉴스가 메신저로 전송될 때 표시될 레이아웃을 이곳에서 편집하실 수 있습니다.
 * 상세 레이아웃 설정 방법은 각 메신저별 개발자 문서를 참고해주세요.
 * ***********************************************************************************************/

// 슬랙(Slack)용 레이아웃
function createArticleCardSlack(pubDateText, title, source, description, link) {
  return card = {
    "text": "[" + source + "] " + title,
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*" + title + "*"
        }
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "*" + source + "* | " + pubDateText
          }
        ]
      },
      {
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": description
        }
      },
      {
        "type": "actions",
        "block_id": "go_to_url",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "기사보기"
            },
            "url": link
          }
        ]
      },
      {
        "type": "divider"
      }
    ]
  }
}

// 팀즈(Microsoft Teams)용 레이아웃
function createArticleCardTeams(pubDateText, title, source, description, link) {
  return card = {
    "type": "message",
    "summary": "[" + source + "] " + title,
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "contentUrl": null,
        "content": {
          "type": "AdaptiveCard",
          "body": [
            {
              "type": "TextBlock",
              "text": title,
              "weight": "Bolder",
              "size": "Large",
              "wrap": true,
              "width": "stretch"
            },
            {
              "type": "ColumnSet",
              "columns": [
                {
                  "type": "Column",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": source,
                      "weight": "Bolder",
                      "wrap": true
                    },
                    {
                      "type": "TextBlock",
                      "spacing": "None",
                      "text": pubDateText,
                      "isSubtle": true,
                      "wrap": true
                    }
                  ],
                  "width": "stretch"
                }
              ]
            },
            {
              "type": "TextBlock",
              "text": description,
              "wrap": true,
              "width": "stretch"
            }
          ],
          "actions": [
            {
              "type": "Action.OpenUrl",
              "url": link,
              "title": "기사보기"
            }
          ],
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "version": "1.4"
        }
      }
    ]
  }
}

// 잔디(JANDI)용 레이아웃
function createArticleCardJandi(pubDateText, title, source, description, link) {
  return card = {
    "body": "[" + title + "](" + link + ")\n" + source + " | " + pubDateText + "\n\n" + description
  }
}

// 구글챗(Google Chat)용 레이아웃
function createArticleCardGoogle(pubDateText, title, source, description, link) {
  return card = {
    "fallbackText": "[" + source + "] " + title,
    "cards": [
      {
        "header": {
          "title": title
        },
        "sections": [
          {
            "header": source,
            "widgets": [
              {
          "textParagraph": {
            "text": description
          }
        },
        {
          "keyValue": {
            "content": pubDateText,
            "icon": "DESCRIPTION",
            "onClick": {
              "openLink": {
                "url": link
              }
            },
            "button": {
              "textButton": {
                "text": "기사보기",
                "onClick": {
                  "openLink": {
                    "url": link
                  }
                }
              }
            }
          }
        }]
      }]
    }]
  }
}
