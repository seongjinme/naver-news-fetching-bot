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

class NewsFetchingBotController {
  constructor({ searchKeywords, lastDeliveredNewsHashIds, lastDeliveredNewsPubDate }) {
    validateConfig(CONFIG);

    this._searchKeywords = searchKeywords || [...CONFIG.KEYWORDS];
    this._lastDeliveredNewsHashIds = lastDeliveredNewsHashIds;
    this._lastDeliveredNewsPubDate = lastDeliveredNewsPubDate || new Date().getTime() - 60 * 1000;

    this._newsFetchService = new NewsFetchService({
      apiUrl: "https://openapi.naver.com/v1/search/news.json",
      clientId: CONFIG.NAVER_API_CLIENT.ID,
      clientSecret: CONFIG.NAVER_API_CLIENT.SECRET,
      newsSource: NEWS_SOURCE,
      lastDeliveredNewsHashIds: this._lastDeliveredNewsHashIds,
      lastDeliveredNewsPubDate: this._lastDeliveredNewsPubDate,
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

    this._isArchivingOnlyMode =
      Object.values(CONFIG.WEBHOOK).every(({ IS_ENABLED, _ }) => !IS_ENABLED) &&
      CONFIG.ARCHIVING.IS_ENABLED;
  }

  _getWebhooksByServices() {
    return Object.entries(CONFIG.WEBHOOK)
      .filter(([_, config]) => config.IS_ENABLED && config.URL.trim() !== "")
      .reduce((webhooks, [key, config]) => {
        webhooks[key] = config.URL;
        return webhooks;
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

  initiateFirstRun() {
    try {
      Logger.log("[INFO] 뉴스봇 초기 설정을 시작합니다.");

      const sampleNewsItems = this._newsFetchService.fetchNewsItems({
        searchKeywords: this._searchKeywords,
        display: 1,
      });

      const isSampleNewsFetched = sampleNewsItems && sampleNewsItems.length > 0;

      if (fetchedNewsItems.length > 0) {
        Logger.log("[INFO] 등록된 검색 키워드별 최근 1개 뉴스를 샘플로 전송하여 드립니다.");
        this.sendNewsItems();
      } else {
        Logger.log("[INFO] 모든 키워드에 대해 검색된 뉴스가 없습니다. 다음 단계로 넘어갑니다.");
      }

      this._saveInitialProperties({ isSampleNewsFetched });
      this._sendWelcomeMessage();
    } catch (error) {
      throw new InitializationError(error.message);
    }
  }

  runDebug() {
    try {
      Logger.log("[INFO] DEBUG 모드가 켜져 있습니다. 뉴스를 가져와 로깅하는 작업만 수행합니다.");

      const fetchedNewsItems = this._newsFetchService.fetchNewsItems({
        searchKeywords: this._searchKeywords,
      });

      fetchedNewsItems.forEach((newsItem, index) => {
        const { pubDateText, title, source, link, description, keywords } = newsItem.data;

        Logger.log(`----- ${fetchedNewsItems.length}개 항목 중 ${index + 1}번째 -----`);
        Logger.log(`${pubDateText}\n${title}\n${source}\n${link}\n${description}`);
        Logger.log(`검색어: ${keywords.join(", ")}`);
      });
    } catch (error) {
      Logger.log(`[ERROR] DEBUG 모드 구동 중 오류 발생: ${error.message}`);
    } finally {
      Logger.log("[INFO] DEBUG 모드 구동이 완료되었습니다.");
    }
  }

  fetchNewsItems() {
    try {
      return this._newsFetchService.fetchNewsItems({
        searchKeywords: this._searchKeywords,
      });
    } catch (error) {
      throw new NewsFetchError(error.message);
    }
  }

  sendNewsItems() {
    if (!this._isWebhookConfigured()) {
      Logger.log(
        "[INFO] 뉴스를 전송할 채팅 서비스가 설정되어 있지 않습니다. 다음 단계로 넘어갑니다.",
      );
      return;
    }

    try {
      const fetchedNewsItems = this._newsFetchService.getFetchedNewsItems();

      if (fetchedNewsItems.length === 0) {
        Logger.log("[INFO] 전송할 새 뉴스 항목이 없습니다.");
        return;
      }

      this._messagingService.sendNewsItems(fetchedNewsItems);
      Logger.log("[SUCCESS] 뉴스 항목 전송이 완료되었습니다.");
    } catch (error) {
      Logger.log(
        `[ERROR] 뉴스 항목 전송 중 오류가 발생했습니다. 현재 작업을 종료하고 다음 단계로 넘어갑니다.\n오류 내용: ${error.message}`,
      );
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
      const newsItems = this._isArchivingOnlyMode
        ? this._newsFetchService.getFetchedNewsItems({ sortByDesc: true })
        : this._messagingService.getDeliveredNewsItems({ sortByDesc: true });

      if (newsItems.length === 0) {
        Logger.log("[INFO] 저장할 새 뉴스 항목이 없습니다.");
        return;
      }

      this._archivingService.archiveNewsItems(newsItems);
      Logger.log("[SUCCESS] 뉴스 항목 저장이 완료되었습니다.");
    } catch (error) {
      Logger.log(
        `[ERROR] 뉴스 항목 저장 중 오류가 발생했습니다. 현재 작업을 종료하고 다음 단계로 넘어갑니다.\n오류 내용: ${error.message}`,
      );
    }
  }

  updateProperties() {
    const lastDeliveredNewsHashIds = this._isArchivingOnlyMode
      ? this._archivingService.archivedNewsHashIds
      : this._messagingService.deliveredNewsHashIds;

    const lastDeliveredNewsPubDate = this._isArchivingOnlyMode
      ? this._archivingService.archivedLatestNewsPubDate
      : this._messagingService.deliveredLatestNewsPubDate;

    this.savePropertiesWithParams({
      searchKeywords: this._searchKeywords,
      lastDeliveredNewsHashIds,
      lastDeliveredNewsPubDate,
    });
  }

  savePropertiesWithParams(params) {
    Object.entries(params).forEach(([key, value]) => {
      PropertyManager.setProperty(key, JSON.stringify(value));
    });
  }

  printResults() {
    if (CONFIG.DEBUG) {
      Logger.log("[RESULT] DEBUG 모드 구동이 완료되었습니다.");
      return;
    }

    const resultNumber = this._isArchivingOnlyMode
      ? this._newsFetchService.getFetchedNewsItems().length
      : this._messagingService.getDeliveredNewsItems().length;

    Logger.log(`[RESULT] 총 ${resultNumber}건의 뉴스 작업이 완료되었습니다.`);
  }

  _isWebhookConfigured() {
    return Object.keys(this._getWebhooksByServices()).length > 0;
  }

  _isSearchKeywordsConfigured() {
    return !this._searchKeywords || this._searchKeywords.length > 0;
  }

  _saveInitialProperties({ isSampleNewsFetched }) {
    const lastDeliveredNewsHashIds = this._messagingService.deliveredNewsHashIds;
    const lastDeliveredNewsPubDate = isSampleNewsFetched
      ? this._messagingService.deliveredLatestNewsPubDate
      : this._lastDeliveredNewsPubDate;

    this.savePropertiesWithParams({
      searchKeywords: this._searchKeywords,
      lastDeliveredNewsHashIds,
      lastDeliveredNewsPubDate,
      initializationCompleted: true,
    });
  }

  _sendWelcomeMessage() {
    const welcomeMessage = `네이버 뉴스봇이 설치되었습니다. 앞으로 '${this._searchKeywords.join(", ")}' 키워드에 대한 최신 뉴스가 전송됩니다.`;

    Logger.log(`[INFO] ${welcomeMessage}`);
    this._messagingService.sendMessage(`[네이버 뉴스봇] ${welcomeMessage}`);
  }
}
