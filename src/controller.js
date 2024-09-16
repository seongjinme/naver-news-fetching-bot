/**
 * 뉴스봇 컨트롤러 클래스입니다.
 */
class NewsFetchingBotController {
  /**
   * NewsFetchingBotController의 생성자입니다.
   * @param {Object} params - 초기화 매개변수
   * @param {string[]|null} params.searchKeywords - 검색 키워드 목록
   * @param {string[]} params.lastDeliveredNewsHashIds - 마지막으로 전달된 뉴스 항목의 해시 ID 목록
   * @param {Date|null} params.lastDeliveredNewsPubDate - 마지막으로 전달된 뉴스의 발행 날짜
   */
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

  /**
   * 뉴스 검색 키워드가 변경되었는지 확인합니다.
   * @returns {boolean} 키워드 변경 여부
   */
  isKeywordsChanged() {
    return this._searchKeywords && !this._arraysEqual(this._searchKeywords, CONFIG.KEYWORDS);
  }

  /**
   * 뉴스 검색 키워드 변경을 처리합니다.
   */
  handleKeywordsChange() {
    this._searchKeywords = [...CONFIG.KEYWORDS];
    PropertyManager.setProperty("searchKeywords", JSON.stringify(this._searchKeywords));

    const message = `검색어 변경이 완료되었습니다. 이제부터 '${this._searchKeywords.join(", ")}' 키워드를 포함한 뉴스를 전송합니다.`;
    Logger.log(`[INFO] ${message}`);
    this._messagingService.sendMessage(`[네이버 뉴스봇] ${message}`);
  }

  /**
   * 최초 실행 시 초기화 작업을 수행합니다.
   * @throws {InitializationError} 초기화 중 오류 발생 시
   */
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

  /**
   * 뉴스봇을 디버그 모드로 실행합니다.
   */
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

  /**
   * 뉴스 항목을 가져옵니다.
   * @returns {NewsItem[]} 가져온 뉴스 항목 목록
   * @throws {NewsFetchError} 뉴스 가져오기 중 오류 발생 시
   */
  fetchNewsItems() {
    try {
      return this._newsFetchService.fetchNewsItems({
        searchKeywords: this._searchKeywords,
      });
    } catch (error) {
      throw new NewsFetchError(error.message);
    }
  }

  /**
   * 뉴스 항목을 채팅 서비스로 전송합니다.
   */
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

  /**
   * 뉴스 항목을 구글 시트로 전송하여 저장합니다.
   */
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

  /**
   * 뉴스봇 구동에 필요한 설정값들을 업데이트하여 저장합니다.
   */
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

  /**
   * 개별 설정값을 {key: value} 형태로 받아 GAS의 PropertiesService를 경유하여 저장합니다.
   * @param {Record<string, T>} params - 저장할 속성 객체
   */
  savePropertiesWithParams(params) {
    Object.entries(params).forEach(([key, value]) => {
      PropertyManager.setProperty(key, JSON.stringify(value));
    });
  }

  /**
   * 뉴스봇 스크립트의 실행 결과를 출력합니다.
   */
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

  /**
   * 뉴스를 전송할 채팅 서비스들의 웹훅 구성이 존재하는지 확인합니다.
   * @returns {boolean} 웹훅 구성 여부
   * @private
   */
  _isWebhookConfigured() {
    return Object.keys(this._getWebhooksByServices()).length > 0;
  }

  /**
   * 뉴스 검색 키워드가 구성되어 있는지 확인합니다.
   * @returns {boolean} 검색 키워드 구성 여부
   * @private
   */
  _isSearchKeywordsConfigured() {
    return this._searchKeywords && this._searchKeywords.length > 0;
  }

  /**
   * 웹훅 서비스 목록을 가져옵니다.
   * @returns {Object} 웹훅 서비스 목록
   * @private
   */
  _getWebhooksByServices() {
    return Object.entries(CONFIG.WEBHOOK)
      .filter(([_, config]) => config.IS_ENABLED && config.URL.trim() !== "")
      .reduce((webhooks, [key, config]) => {
        webhooks[key] = config.URL;
        return webhooks;
      }, {});
  }

  /**
   * 뉴스봇의 첫 구동때 설정된 초기 설정값을 저장합니다.
   * @param {Object} params - 저장할 속성 매개변수
   * @param {boolean} params.isSampleNewsFetched - 샘플 뉴스 가져오기 성공 여부
   * @private
   */
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

  /**
   * 뉴스봇 첫 구동 후 설치가 성공적으로 완료되었을 경우, 환영 메시지를 전송합니다.
   * @private
   */
  _sendWelcomeMessage() {
    const welcomeMessage = `네이버 뉴스봇이 설치되었습니다. 앞으로 '${this._searchKeywords.join(", ")}' 키워드에 대한 최신 뉴스가 전송됩니다.`;

    Logger.log(`[INFO] ${welcomeMessage}`);
    this._messagingService.sendMessage(`[네이버 뉴스봇] ${welcomeMessage}`);
  }
}
