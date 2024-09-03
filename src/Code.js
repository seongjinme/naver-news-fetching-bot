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

function getProperties() {
  const savedSearchKeywords = PropertyManager.getProperty("searchKeywords");
  const savedLastDeliveredNewsHashIds = PropertyManager.getProperty("lastDeliveredNewsHashIds");
  const savedLastDeliveredNewsPubDate = PropertyManager.getProperty("lastDeliveredNewsPubDate");

  return {
    searchKeywords: savedSearchKeywords ? JSON.parse(savedSearchKeywords) : null,
    lastDeliveredNewsHashIds: savedLastDeliveredNewsHashIds
      ? JSON.parse(savedLastDeliveredNewsHashIds)
      : [],
    lastDeliveredNewsPubDate: savedLastDeliveredNewsPubDate
      ? new Date(parseFloat(savedLastDeliveredNewsPubDate))
      : null,
  };
}

function runNewsFetchingBot() {
  try {
    // TODO: 뉴스봇 최초 실행 여부를 판별하여 분기 처리하는 로직 추가
    // TODO: 키워드에 대한 검색 결과가 아예 없을 때 데이터 처리 로직 추가
    const controller = new NewsFetchingBotController(getProperties());

    if (controller.isKeywordsChanged()) {
      controller.handleKeywordsChange();
    }

    if (CONFIG.DEBUG) {
      controller.runDebug();
      return;
    }

    controller.sendNewsItems();
    controller.archiveNewsItems();
    controller.updateProperties();
  } catch (error) {
    Logger.log(`* 에러로 인해 뉴스봇 구동을 중지합니다. 아래 메시지를 참고해 주세요.`);

    if (error instanceof PropertyError) {
      Logger.log(`[ERROR] Google Apps Script 환경 오류 발생: ${error.message}`);
      return;
    }

    if (error instanceof ConfigValidationError) {
      Logger.log(`[ERROR] 뉴스봇 설정값 오류 발생: ${error.message}`);
      return;
    }

    Logger.log(`[ERROR] 예상치 못한 오류 발생: ${error.message}`);
  } finally {
    controller.printResults();
  }
}

class NewsFetchingBotController {
  constructor({ searchKeywords, lastDeliveredNewsHashIds, lastDeliveredNewsPubDate }) {
    this._searchKeywords = searchKeywords;
    this._lastDeliveredNewsHashIds = lastDeliveredNewsHashIds;
    this._lastDeliveredNewsPubDate = lastDeliveredNewsPubDate;

    validateConfig(CONFIG);

    this._newsFetchService = new NewsFetchService({
      apiUrl: "https://openapi.naver.com/v1/search/news.json",
      clientId: CONFIG.NAVER_API_CLIENT.ID,
      clientSecret: CONFIG.NAVER_API_CLIENT.SECRET,
      newsSource: NEWS_SOURCE,
      newsItemMapProps: {
        lastDeliveredNewsHashIds: [...this._lastDeliveredNewsHashIds],
        lastDeliveredNewsPubDate: this._lastDeliveredNewsPubDate,
      },
    });

    if (!CONFIG.DEBUG) {
      this._messagingService = new MessagingService({
        webhooks: this._getWebhooksByServices(),
        newsCardGenerator: NewsCardGenerator,
        messageGenerator: MessageGenerator,
      });

      this._archivingService = new ArchivingService({
        config: CONFIG.ARCHIVING_SHEET.SHEET_INFO,
      });
    }
  }

  _getWebhooksByServices() {
    Object.entries(CONFIG.WEBHOOK)
      .filter(([_, config]) => config.IS_ENABLED && config.URL.trim() !== "")
      .reduce((acc, [key, config]) => {
        acc[key] = config.URL;
        return acc;
      }, {});
  }

  isKeywordsChanged() {
    return this._searchKeywords && !this._arraysEqual(this._searchKeywords, CONFIG.KEYWORDS);
  }

  handleKeywordsChange() {
    this._searchKeywords = [...CONFIG.KEYWORDS];
    PropertyManager.setProperty("searchKeywords", JSON.stringify(this._searchKeywords));

    const message = `검색어 변경이 완료되었습니다. 이제부터 '${this._searchKeywords.join(", ")}' 키워드를 포함한 뉴스를 전송합니다.`;
    Logger.log(`[INFO] ${message}`);
    this._messagingService.sendMessage(`[네이버 뉴스봇] ${message}`);
  }

  runDebug() {
    try {
      Logger.log("[INFO] DEBUG 모드가 켜져 있습니다. 뉴스를 가져와 로깅하는 작업만 수행합니다.");

      const fetchedNewsItems = this._newsFetchService.fetchNewsItems(this._searchKeywords);
      fetchedNewsItems.forEach((newsItem, index) => {
        const { pubDateText, title, source, link, description, keywords } = newsItem.data;

        Logger.log(`----- ${fetchedNewsItems.length}개 항목 중 ${index + 1}번째 -----`);
        Logger.log(`${pubDateText}\n${title}\n${source}\n${link}\n${description}`);
        Logger.log(`검색어: ${keywords.join(", ")}`);
      });
    } catch (error) {
      Logger.log(`[ERROR] DEBUG 모드 구동 중 오류 발생: ${error.message}`);
    }
  }

  sendNewsItems() {
    if (Object.keys(this._getWebhooksByServices()).length === 0) {
      Logger.log(
        "[INFO] 뉴스를 전송할 채팅 서비스가 설정되어 있지 않습니다. 다음 단계로 넘어갑니다.",
      );
      return;
    }

    try {
      const fetchedNewsItems = this._newsFetchService.fetchNewsItems(this._searchKeywords);
      this._messagingService.sendNewsItems(fetchedNewsItems);
      Logger.log("[SUCCESS] 뉴스 항목 전송이 완료되었습니다.");
    } catch (error) {
      Logger.log(`[ERROR] 뉴스 항목 전송 중 오류 발생: ${error.message}`);
    }
  }

  archiveNewsItems() {
    if (!CONFIG.ARCHIVING.IS_ENABLED) {
      Logger.log(
        "[INFO] 뉴스를 저장할 구글 시트 정보가 설정되어 있지 않습니다. 다음 단계로 넘어갑니다.",
      );
      return;
    }

    try {
      const deliveredNewsItems = this._messagingService.deliveredNewsItems;
      this._archivingService.archiveNewsItems(deliveredNewsItems);
      Logger.log("[SUCCESS] 뉴스 항목 저장이 완료되었습니다.");
    } catch (error) {
      Logger.log(`[ERROR] 뉴스 항목 저장 중 오류 발생: ${error.message}`);
    }
  }

  printResults() {
    if (CONFIG.DEBUG) {
      Logger.log("[RESULT] DEBUG 모드 구동이 완료되었습니다.");
      return;
    }

    const resultNumber = this._messagingService.deliveredNewsItems.length;
    Logger.log(`[RESULT] 총 ${resultNumber}건의 뉴스 작업이 완료되었습니다.`);
  }
}
