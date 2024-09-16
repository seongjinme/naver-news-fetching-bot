/*************************************************************************************************
 * Naver News Fetching Bot (v3.0.0)
 * ***********************************************************************************************
 * 원하는 검색어가 포함된 최신 네이버 뉴스를 업무용 채팅 솔루션으로 전송합니다.
 * 슬랙(Slack), 잔디(JANDI), 구글챗(Google Chat Space)을 지원합니다.
 * Google Apps Script와 네이버 검색 오픈 API를 이용합니다.
 *
 * config.gs에서 뉴스봇 구동에 필요한 설정값들을 미리 삽입하신 뒤에 이용해주세요.
 *
 * - Github : https://github.com/seongjinme/naver-news-fetching-bot
 * - 문의사항 : mail@seongjin.me
 * ***********************************************************************************************/

/**
 * 네이버 뉴스봇의 메인 실행 함수입니다.
 * Google Apps Script 환경에서 실행 트리거를 설정하실 때 이 함수를 실행 대상으로 설정해 주세요.
 */
function runNewsFetchingBot() {
  try {
    const controllerProperties = getControllerProperties();
    const controller = new NewsFetchingBotController(controllerProperties);

    if (controllerProperties.isFirstRun) {
      controller.initiateFirstRun();
      return;
    }

    if (controller.isKeywordsChanged()) {
      controller.handleKeywordsChange();
    }

    if (CONFIG.DEBUG) {
      controller.runDebug();
      return;
    }

    controller.fetchNewsItems();
    controller.sendNewsItems();
    controller.archiveNewsItems();
    controller.updateProperties();
  } catch (error) {
    Logger.log(`[ERROR] 에러로 인해 뉴스봇 구동을 중지합니다. 아래 메시지를 참고해 주세요.`);

    if (error instanceof PropertyError) {
      Logger.log(`[ERROR] Google Apps Script 환경 오류 발생: ${error.message}`);
      return;
    }

    if (error instanceof ConfigValidationError) {
      Logger.log(`[ERROR] 뉴스봇 설정값 오류 발생: ${error.message}`);
      return;
    }

    if (error instanceof NewsFetchError) {
      Logger.log(`[ERROR] 뉴스 수신 중 오류 발생: ${error.message}`);
      return;
    }

    Logger.log(`[ERROR] 예상치 못한 오류 발생: ${error.message}`);
  } finally {
    controller.printResults();
  }
}

/**
 * 컨트롤러 속성을 가져옵니다.
 * @returns {Object} 컨트롤러 속성 객체
 * @property {Array<string>|null} searchKeywords - 저장된 검색 키워드 목록
 * @property {Array<string>} lastDeliveredNewsHashIds - 마지막으로 전달된 뉴스 항목의 해시 ID 목록
 * @property {Date|null} lastDeliveredNewsPubDate - 마지막으로 전달된 뉴스의 발행 날짜
 * @property {boolean} isFirstRun - 최초 실행 여부
 */
function getControllerProperties() {
  const savedSearchKeywords = PropertyManager.getProperty("searchKeywords");
  const savedLastDeliveredNewsHashIds = PropertyManager.getProperty("lastDeliveredNewsHashIds");
  const savedLastDeliveredNewsPubDate = PropertyManager.getProperty("lastDeliveredNewsPubDate");
  const savedInitializationCompleted = PropertyManager.getProperty("initializationCompleted");

  return {
    searchKeywords: savedSearchKeywords ? JSON.parse(savedSearchKeywords) : null,
    lastDeliveredNewsHashIds: savedLastDeliveredNewsHashIds
      ? JSON.parse(savedLastDeliveredNewsHashIds)
      : [],
    lastDeliveredNewsPubDate: savedLastDeliveredNewsPubDate
      ? new Date(parseFloat(savedLastDeliveredNewsPubDate))
      : null,
    isFirstRun: !(savedInitializationCompleted && savedInitializationCompleted === "true"),
  };
}
