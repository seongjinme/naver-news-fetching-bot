/*************************************************************************************************
 * Naver News Fetching Bot: template.gs
 * ***********************************************************************************************
 * 네이버 뉴스가 메신저로 전송될 때 표시될 레이아웃을 이곳에서 편집하실 수 있습니다.
 * 상세 레이아웃 설정 방법은 각 메신저별 개발자 문서를 참고해주세요.
 * ***********************************************************************************************/

/*************************************************************************************************
 * 슬랙(Slack)용 뉴스 카드 및 메시지 레이아웃
 * ***********************************************************************************************/

/**
 * 슬랙용 뉴스 카드를 생성합니다.
 * @param {Object} params - 뉴스 항목 정보
 * @param {string} params.pubDateText - 발행일 텍스트
 * @param {string} params.title - 뉴스 제목
 * @param {string} params.source - 뉴스 출처
 * @param {string} params.description - 뉴스 설명
 * @param {string} params.link - 뉴스 링크 URL
 * @returns {Object} 슬랙 메시지 카드 객체
 */
function createArticleCardSlack({ pubDateText, title, source, description, link }) {
  return {
    text: "[" + source + "] " + title,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*" + title + "*",
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "*" + source + "* | " + pubDateText,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "plain_text",
          text: description,
        },
      },
      {
        type: "actions",
        block_id: "go_to_url",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "기사보기",
            },
            url: link,
          },
        ],
      },
      {
        type: "divider",
      },
    ],
  };
}

/**
 * 슬랙용 일반 메시지를 생성합니다.
 * @param {string} message - 전송할 메시지 내용
 * @returns {Object} 슬랙 메시지 객체
 */
function createMessageSlack(message) {
  return {
    text: message,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
      {
        type: "divider",
      },
    ],
  };
}

/*************************************************************************************************
 * 팀즈(Microsoft Teams)용 뉴스 카드 및 메시지 레이아웃
 * ***********************************************************************************************/

/**
 * 팀즈용 뉴스 카드를 생성합니다.
 * @param {Object} params - 뉴스 항목 정보
 * @param {string} params.pubDateText - 발행일 텍스트
 * @param {string} params.title - 뉴스 제목
 * @param {string} params.source - 뉴스 출처
 * @param {string} params.description - 뉴스 설명
 * @param {string} params.link - 뉴스 링크 URL
 * @returns {Object} 팀즈 메시지 카드 객체
 */
function createArticleCardTeams({ pubDateText, title, source, description, link }) {
  return {
    type: "message",
    summary: "[" + source + "] " + title,
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          type: "AdaptiveCard",
          body: [
            {
              type: "TextBlock",
              text: title,
              weight: "Bolder",
              size: "Large",
              wrap: true,
              width: "stretch",
            },
            {
              type: "ColumnSet",
              columns: [
                {
                  type: "Column",
                  items: [
                    {
                      type: "TextBlock",
                      text: source,
                      weight: "Bolder",
                      wrap: true,
                    },
                    {
                      type: "TextBlock",
                      spacing: "None",
                      text: pubDateText,
                      isSubtle: true,
                      wrap: true,
                    },
                  ],
                  width: "stretch",
                },
              ],
            },
            {
              type: "TextBlock",
              text: description,
              wrap: true,
              width: "stretch",
            },
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              url: link,
              title: "기사보기",
            },
          ],
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.4",
        },
      },
    ],
  };
}

/**
 * 팀즈용 일반 메시지를 생성합니다.
 * @param {string} message - 전송할 메시지 내용
 * @returns {Object} 팀즈 메시지 객체
 */
function createMessageTeams(message) {
  return {
    type: "message",
    summary: message,
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          type: "AdaptiveCard",
          body: [
            {
              type: "TextBlock",
              wrap: true,
              text: message,
            },
          ],
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.4",
        },
      },
    ],
  };
}

/*************************************************************************************************
 * 잔디(JANDI)용 뉴스 카드 및 메시지 레이아웃
 * ***********************************************************************************************/

/**
 * 잔디용 뉴스 카드를 생성합니다.
 * @param {Object} params - 뉴스 항목 정보
 * @param {string} params.pubDateText - 발행일 텍스트
 * @param {string} params.title - 뉴스 제목
 * @param {string} params.source - 뉴스 출처
 * @param {string} params.description - 뉴스 설명
 * @param {string} params.link - 뉴스 링크 URL
 * @returns {Object} 잔디 메시지 카드 객체
 */
function createArticleCardJandi({ pubDateText, title, source, description, link }) {
  return {
    body: "[" + title + "](" + link + ")\n" + source + " | " + pubDateText + "\n\n" + description,
  };
}

/**
 * 잔디용 일반 메시지를 생성합니다.
 * @param {string} message - 전송할 메시지 내용
 * @returns {Object} 잔디 메시지 객체
 */
function createMessageJandi(message) {
  return {
    body: message,
  };
}

/*************************************************************************************************
 * 구글챗(Google Chat)용 뉴스 카드 및 메시지 레이아웃
 * ***********************************************************************************************/

/**
 * 구글챗용 뉴스 카드를 생성합니다.
 * @param {Object} params - 뉴스 항목 정보
 * @param {string} params.pubDateText - 발행일 텍스트
 * @param {string} params.title - 뉴스 제목
 * @param {string} params.source - 뉴스 출처
 * @param {string} params.description - 뉴스 설명
 * @param {string} params.link - 뉴스 링크 URL
 * @returns {Object} 구글챗 메시지 카드 객체
 */
function createArticleCardGoogle({ pubDateText, title, source, description, link }) {
  return {
    fallbackText: "[" + source + "] " + title,
    cards: [
      {
        header: {
          title: title,
        },
        sections: [
          {
            header: source,
            widgets: [
              {
                textParagraph: {
                  text: description,
                },
              },
              {
                keyValue: {
                  content: pubDateText,
                  icon: "DESCRIPTION",
                  onClick: {
                    openLink: {
                      url: link,
                    },
                  },
                  button: {
                    textButton: {
                      text: "기사보기",
                      onClick: {
                        openLink: {
                          url: link,
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * 구글챗용 일반 메시지를 생성합니다.
 * @param {string} message - 전송할 메시지 내용
 * @returns {Object} 구글챗 메시지 객체
 */
function createMessageGoogle(message) {
  return {
    text: message,
  };
}

/*************************************************************************************************
 * 초기 설정 완료시 안내 메시지
 * ***********************************************************************************************/

/**
 * 초기 설정 완료 시 안내 메시지를 생성합니다.
 * @param {Array<string>} searchKeywords - 설정된 검색 키워드들
 * @returns {string} 초기 설정 완료 안내 메시지
 */
function createWelcomeMessage(searchKeywords) {
  return `"[Naver News Fetching Bot 설치 완료]\n\n네이버 뉴스 봇이 설치되었습니다. 앞으로 '${searchKeywords.join(", ")}' 키워드에 대한 최신 뉴스가 주기적으로 전송됩니다.`;
}

/*************************************************************************************************
 * 검색 키워드 변경시 안내 메시지
 * ***********************************************************************************************/

/**
 * 검색 키워드 변경 시 안내 메시지를 생성합니다.
 * @param {Array<string>} before - 변경 전 검색 키워드들
 * @param {Array<string>} after - 변경 후 검색 키워드들
 * @returns {string} 검색 키워드 변경 안내 메시지
 */
function createKeywordsChangedMessage(before, after) {
  return `[Naver News Fetching Bot 키워드 변경 완료]\n\n네이버 뉴스 봇의 검색 키워드가 '${before}'에서 '${after}'로 변경되었습니다.`;
}
