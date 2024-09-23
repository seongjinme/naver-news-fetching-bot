/*************************************************************************************************
 * Naver News Fetching Bot: template.gs
 * ***********************************************************************************************
 * 네이버 뉴스가 메신저로 전송될 때 표시될 레이아웃을 이곳에서 편집하실 수 있습니다.
 * 상세 레이아웃 설정 방법은 각 메신저별 개발자 문서를 참고해주세요.
 * ***********************************************************************************************/

/**
 * 각 메신저별 뉴스 전송용 메시지 카드 레이아웃을 생성하는 유틸리티 객체입니다.
 * @typedef {Object} NewsCardGenerator
 * @property {function(Object): Object} slack - Slack용 뉴스 카드 객체 생성 함수
 * @property {function(Object): Object} jandi - JANDI용 뉴스 카드 객체 생성 함수
 * @property {function(Object): Object} googleChat - Google Chat용 뉴스 카드 객체 생성 함수
 */
export const NewsCardGenerator = {
  /**
   * 슬랙용 뉴스 카드를 생성합니다.
   * @param {Object} params - 뉴스 항목 정보
   * @param {string} params.title - 뉴스 제목
   * @param {string} params.link - 뉴스 링크 URL
   * @param {string} params.source - 뉴스 출처
   * @param {string} params.description - 뉴스 설명
   * @param {string} params.pubDateText - 발행일 텍스트
   * @param {string[]} params.keywords - 뉴스에 해당하는 검색어 목록
   * @returns {Object} 슬랙 메시지 카드 객체
   */
  slack: ({ title, link, source, description, pubDateText, keywords }) => {
    return {
      text: `[${source}] ${title}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${title}*`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*${source}* | ${pubDateText}`,
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
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*검색어 :* ${keywords.join(", ")}`,
            },
          ],
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
  },

  /**
   * 잔디용 뉴스 카드를 생성합니다.
   * @param {Object} params - 뉴스 항목 정보
   * @param {string} params.title - 뉴스 제목
   * @param {string} params.link - 뉴스 링크 URL
   * @param {string} params.source - 뉴스 출처
   * @param {string} params.description - 뉴스 설명
   * @param {string} params.pubDateText - 발행일 텍스트
   * @param {string[]} params.keywords - 뉴스에 해당하는 검색어 목록
   * @returns {Object} 잔디 메시지 카드 객체
   */
  jandi: ({ title, link, source, description, pubDateText, keywords }) => {
    const body = `[${title}](${link})\n${source} | ${pubDateText}\n\n${description}\n\n검색어: ${keywords.join(", ")}`;
    return { body };
  },

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
  googleChat: ({ title, link, source, description, pubDateText, keywords }) => {
    return {
      fallbackText: `[${source}] ${title}`,
      cards: [
        {
          header: {
            title: title,
            subtitle: `${source} | ${pubDateText}`,
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
                  textParagraph: {
                    text: `<b>검색어 :</b> ${keywords.join(", ")}`,
                  },
                },
                {
                  buttonList: {
                    buttons: [
                      {
                        text: "기사보기",
                        onClick: {
                          openLink: {
                            url: link,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  },
};

/**
 * 각 메신저별 뉴스 전송용 메시지 카드 레이아웃을 생성하는 유틸리티 객체입니다.
 * @typedef {Object} MessageGenerator
 * @property {function(Object): Object} slack - Slack용 메시지 객체 생성 함수
 * @property {function(Object): Object} jandi - JANDI용 메시지 객체 생성 함수
 * @property {function(Object): Object} googleChat - Google Chat용 메시지 객체 생성 함수
 */
export const MessageGenerator = {
  /**
   * 슬랙용 일반 메시지를 생성합니다.
   * @param {string} message - 전송할 메시지 내용
   * @returns {Object} 슬랙 메시지 객체
   */
  slack: (message) => {
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
  },

  /**
   * 잔디용 일반 메시지를 생성합니다.
   * @param {string} message - 전송할 메시지 내용
   * @returns {Object} 잔디 메시지 객체
   */
  jandi: (message) => {
    return {
      body: message,
    };
  },

  /**
   * 구글챗용 일반 메시지를 생성합니다.
   * @param {string} message - 전송할 메시지 내용
   * @returns {Object} 구글챗 메시지 객체
   */
  googleChat: (message) => {
    return {
      text: message,
    };
  },
};

/*************************************************************************************************
 * 초기 설정 완료시 안내 메시지
 * ***********************************************************************************************/

/**
 * 초기 설정 완료 시 안내 메시지를 생성합니다.
 * @param {string[]} searchKeywords - 설정된 검색 키워드들
 * @returns {string} 초기 설정 완료 안내 메시지
 */
export function createWelcomeMessage(searchKeywords) {
  return `"[네이버 뉴스 봇 설치 완료]\n\n앞으로 '${searchKeywords.join(", ")}' 키워드에 대한 최신 뉴스가 주기적으로 전송됩니다.`;
}

/*************************************************************************************************
 * 검색 키워드 변경시 안내 메시지
 * ***********************************************************************************************/

/**
 * 검색 키워드 변경 시 안내 메시지를 생성합니다.
 * @param {string[]} before - 변경 전 검색 키워드들
 * @param {string[]} after - 변경 후 검색 키워드들
 * @returns {string} 검색 키워드 변경 안내 메시지
 */
export function createKeywordsChangedMessage(before, after) {
  return `[네이버 뉴스 봇 키워드 변경 완료]\n\n뉴스 검색 키워드가 '${before}'에서 '${after}'로 변경되었습니다.`;
}
