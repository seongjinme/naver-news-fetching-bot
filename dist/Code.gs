/*************************************************************************************************
 * Naver News Fetching Bot (v3.0.0)
 * ***********************************************************************************************
 * 원하는 검색어가 포함된 최신 네이버 뉴스를 업무용 채팅 솔루션으로 전송합니다.
 * 슬랙(Slack), 디스코드(Discord), 잔디(JANDI), 구글챗(Google Chat Space)을 지원합니다.
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
    const controller = new NewsFetchingBotController();

    if (controller.isFirstRun()) {
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

    if (controller.fetchNewsItems().length > 0) {
      controller.sendNewsItems();
      controller.archiveNewsItems();
    }

    controller.updateProperties();
    controller.printResults();
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

    if (error instanceof InitializationError) {
      Logger.log(`[ERROR] 뉴스봇 초기 설정 중 오류 발생: ${error.message}`);
      return;
    }

    Logger.log(`[ERROR] 예상치 못한 오류 발생: ${error.message}`);
  }
}


/**
 * 뉴스봇 컨트롤러 클래스입니다.
 */
class NewsFetchingBotController {
  /**
   * NewsFetchingBotController의 생성자입니다.
   */
  constructor() {
    validateConfig(CONFIG);

    const { searchKeywords, lastDeliveredNewsHashIds, lastDeliveredNewsPubDate, isFirstRun } =
      this._getControllerProperties();

    this._searchKeywords = searchKeywords || [...CONFIG.KEYWORDS];
    this._lastDeliveredNewsHashIds = lastDeliveredNewsHashIds;
    this._lastDeliveredNewsPubDate = lastDeliveredNewsPubDate || this._createInitialLastDeliveredNewsPubDate();
    this._isFirstRun = isFirstRun;

    this._fetchingService = new FetchingService({
      apiUrl: "https://openapi.naver.com/v1/search/news.json",
      clientId: CONFIG.NAVER_API_CLIENT.ID,
      clientSecret: CONFIG.NAVER_API_CLIENT.SECRET,
      newsSource: NEWS_SOURCE,
      lastDeliveredNewsHashIds: this._lastDeliveredNewsHashIds,
      lastDeliveredNewsPubDate: this._lastDeliveredNewsPubDate,
    });

    this._messagingService = new MessagingService({
      webhooks: this._getWebhooksByServices(),
      newsCardGenerator: NewsCardGenerator,
      messageGenerator: MessageGenerator,
    });

    this._archivingService = new ArchivingService({
      config: CONFIG.ARCHIVING.SHEET_INFO,
    });

    this._isArchivingOnlyMode =
      Object.values(CONFIG.WEBHOOK).every(({ IS_ENABLED, _ }) => !IS_ENABLED) && CONFIG.ARCHIVING.IS_ENABLED;
  }

  /**
   * 뉴스봇 최초 실행 여부를 반환합니다.
   * @returns {boolean} 뉴스봇 최초 실행 여부
   */
  isFirstRun() {
    return this._isFirstRun;
  }

  /**
   * 뉴스 검색 키워드가 변경되었는지 확인합니다.
   * @returns {boolean} 키워드 변경 여부
   */
  isKeywordsChanged() {
    return this._searchKeywords && !isTwoArraysEqual(this._searchKeywords, CONFIG.KEYWORDS);
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

      const sampleNewsItems = this._fetchingService.fetchNewsItems({
        searchKeywords: this._searchKeywords,
        display: 1,
      });

      if (CONFIG.DEBUG) {
        Logger.log("[INFO] 디버그 모드 실행: 등록된 검색 키워드별 최근 1개 뉴스를 로깅합니다.");
        this._printFetchedNewsItems(sampleNewsItems);
      } else {
        Logger.log("[INFO] 등록된 검색 키워드별 최근 1개 뉴스를 샘플로 전송하여 드립니다.");
        this.sendNewsItems();
      }

      this._saveInitialProperties();
      this._deleteAllTriggers();
      this._initializeTriggerWithInterval();
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
      Logger.log(
        "[INFO] DEBUG 모드가 켜져 있습니다.\n- 뉴스를 가져와 로깅하는 작업만 수행합니다.\n- 최근 뉴스 목록, 최종 게재 시각 등의 정보는 별도로 저장되지 않습니다.",
      );

      const fetchedNewsItems = this._fetchingService.fetchNewsItems({
        searchKeywords: this._searchKeywords,
      });

      this._printFetchedNewsItems(fetchedNewsItems);
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
      return this._fetchingService.fetchNewsItems({
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
      Logger.log("[INFO] 뉴스를 전송할 채팅 서비스가 설정되어 있지 않습니다. 다음 단계로 넘어갑니다.");
      return;
    }

    try {
      const fetchedNewsItems = this._fetchingService.getNewsItems({ sortByDesc: false });

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
      Logger.log("[INFO] 뉴스를 저장할 구글 시트 정보가 설정되어 있지 않습니다. 다음 단계로 넘어갑니다.");
      return;
    }

    try {
      const newsItems = this._isArchivingOnlyMode
        ? this._fetchingService.getNewsItems({ sortByDesc: true })
        : this._messagingService.getNewsItems({ sortByDesc: true });

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
    const newHashIds = this._isArchivingOnlyMode
      ? this._archivingService.newsHashIds
      : this._messagingService.newsHashIds;

    const newPubDate = this._isArchivingOnlyMode
      ? this._archivingService.latestNewsPubDate
      : this._messagingService.latestNewsPubDate;

    const lastDeliveredNewsHashIds =
      newHashIds.length > 0 && newPubDate && newPubDate > this._lastDeliveredNewsPubDate
        ? newHashIds
        : [...this._lastDeliveredNewsHashIds, ...newHashIds];

    this.savePropertiesWithParams({
      searchKeywords: this._searchKeywords,
      lastDeliveredNewsHashIds,
      lastDeliveredNewsPubDate: newPubDate ?? this._lastDeliveredNewsPubDate,
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

    if (this._fetchingService.newsItemsSize === 0) {
      Logger.log("[RESULT] 새로 게재된 된 뉴스 항목이 없습니다. 작업을 종료합니다.");
      return;
    }

    const resultNumber = this._isArchivingOnlyMode
      ? this._archivingService.newsItemsSize
      : this._messagingService.newsItemsSize;

    Logger.log(`[RESULT] 총 ${resultNumber}건의 뉴스 작업이 완료되었습니다.`);
  }

  /**
   * 뉴스봇 컨트롤러 구동에 필요한 속성들을 PropertiesService로부터 가져옵니다.
   * @typedef {Object} ControllerProperties
   * @property {Array<string>|null} searchKeywords - 저장된 검색 키워드 목록
   * @property {Array<string>} lastDeliveredNewsHashIds - 마지막으로 전달된 뉴스 항목의 해시 ID 목록
   * @property {Date|null} lastDeliveredNewsPubDate - 마지막으로 전달된 뉴스의 발행 날짜
   * @property {boolean} isFirstRun - 최초 실행 여부
   * @returns {ControllerProperties}
   * @private
   */
  _getControllerProperties() {
    const savedSearchKeywords = PropertyManager.getProperty("searchKeywords");
    const savedLastDeliveredNewsHashIds = PropertyManager.getProperty("lastDeliveredNewsHashIds");
    const savedLastDeliveredNewsPubDate = PropertyManager.getProperty("lastDeliveredNewsPubDate");
    const savedInitializationCompleted = PropertyManager.getProperty("initializationCompleted");

    return {
      searchKeywords: savedSearchKeywords ? JSON.parse(savedSearchKeywords) : null,
      lastDeliveredNewsHashIds: savedLastDeliveredNewsHashIds ? JSON.parse(savedLastDeliveredNewsHashIds) : [],
      lastDeliveredNewsPubDate: savedLastDeliveredNewsPubDate
        ? new Date(JSON.parse(savedLastDeliveredNewsPubDate))
        : null,
      isFirstRun: !(savedInitializationCompleted && savedInitializationCompleted === "true"),
    };
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
   * 마지막으로 전송된 뉴스 게재 시각의 초기값을 반환합니다.
   * @returns {Date} 마지막으로 전송된 뉴스 게재 시각 초기값
   * @private
   */
  _createInitialLastDeliveredNewsPubDate() {
    return new Date(new Date().getTime() - 60 * 1000);
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
   * @private
   */
  _saveInitialProperties() {
    this.savePropertiesWithParams({
      searchKeywords: this._searchKeywords,
      lastDeliveredNewsHashIds: this._fetchingService.newsHashIds,
      lastDeliveredNewsPubDate: this._fetchingService.newsPubDate ?? this._lastDeliveredNewsPubDate,
      initializationCompleted: true,
    });
  }

  /**
   * 뉴스 항목들을 GAS 환경의 Logger로 로깅하여 프린트합니다.
   * @param {Object} params - 매개변수
   * @param {NewsItem[]} params.newsitems - 뉴스 항목들
   * @private
   */
  _printFetchedNewsItems(newsItems) {
    if (newsItems && newsItems.length > 0) {
      newsItems.forEach((newsItem, index) => {
        const { pubDateText, title, source, link, description, keywords } = newsItem.data;

        Logger.log(`----- ${newsItems.length}개 항목 중 ${index + 1}번째 -----`);
        Logger.log(
          `게재시각: ${pubDateText}\n기사제목: ${title}\n기사출처: ${source}\n원문링크: ${link}\n본문내용: ${description}\n검색어: ${keywords.join(", ")}`,
        );
      });

      Logger.log(`[INFO] ${newsItems.length}개 항목에 대한 로깅 작업을 완료했습니다.`);
      return;
    }

    Logger.log("[INFO] 모든 키워드에 대해 검색된 뉴스가 없습니다. 로깅 작업을 종료합니다.");
  }

  /**
   * GAS 프로젝트에 남아있는 기존 트리거를 제거하고, 뉴스봇 스크립트의 자동 실행 트리거를 설정합니다.
   * @param {number} [intervalMinutes] - 분 단위 실행 간격 (1, 5, 10, 15, 30 중 택일)
   * @throws {InitializationError} 트리거 설정 중 오류 발생 시
   */
  _initializeTriggerWithInterval(intervalMinutes = 1) {
    try {
      ScriptApp.newTrigger("runNewsFetchingBot").timeBased().everyMinutes(intervalMinutes).create();
    } catch (error) {
      throw new InitializationError(error.message);
    }
  }

  /**
   * GAS 프로젝트에 남아있는 기존 트리거들을 모두 제거합니다.
   * @throws {InitializationError} 트리거 제거 중 오류 발생 시
   */
  _deleteAllTriggers() {
    try {
      const existingTriggers = ScriptApp.getProjectTriggers();
      if (existingTriggers.length > 0) {
        existingTriggers.forEach((trigger) => ScriptApp.deleteTrigger(trigger));
      }
    } catch (error) {
      throw new InitializationError(error.message);
    }
  }

  /**
   * 뉴스봇 첫 구동 후 설치가 성공적으로 완료되었을 경우, 환영 메시지를 전송합니다.
   * @private
   */
  _sendWelcomeMessage() {
    const welcomeMessage = `네이버 뉴스봇이 설치되었습니다. 앞으로 '${this._searchKeywords.join(", ")}' 키워드에 대한 최신 뉴스가 전송됩니다.`;

    Logger.log(`[INFO] ${welcomeMessage}`);

    if (!CONFIG.DEBUG) {
      this._messagingService.sendMessage(`[네이버 뉴스봇] ${welcomeMessage}`);
    }
  }
}
/**
 * NewsItem은 개별 뉴스 기사의 정보를 다루고 관리합니다.
 */
class NewsItem {
  /**
   * NewsItem 클래스의 생성자입니다.
   * @param {Object} newsData - 뉴스 기사 정보
   * @param {string} newsData.title - 기사 제목
   * @param {string} newsData.link - 기사 링크
   * @param {string} newsData.source - 기사 출처
   * @param {string} newsData.description - 기사 설명
   * @param {Date} newsData.pubDate - 기사 게재 시각
   * @param {string} newsData.keyword - 기사 검색어
   */
  constructor({ title, link, source, description, pubDate, keyword }) {
    this._title = title;
    this._link = link;
    this._source = source;
    this._description = description;
    this._pubDate = pubDate;
    this._keywords = [keyword];
    this._hashId = this._createHashId({ newsItemUrl: link });
  }

  /**
   * 뉴스 기사의 고유한 해시 ID값을 생성합니다.
   * @param {Object} params - 매개변수
   * @param {string} newsItemUrl - 뉴스 기사 URL 주소
   * @param {number} hashIdLength - 생성할 해시 ID값의 길이
   * @returns {string} 생성된 해시 ID값
   */
  _createHashId({ newsItemUrl, hashIdLength = 8 }) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // 해싱 연산용 소수 및 모듈러 설정
    const prime = 31;
    const mod = 1e9 + 9;

    let hash = Array.from({ length: newsItemUrl.length }).reduce((acc, _, index) => {
      return (acc * prime + newsItemUrl.charCodeAt(index)) % mod;
    }, 0);

    return Array.from({ length: hashIdLength }).reduce((hashId) => {
      const index = Math.abs(hash % characters.length);
      hashId += characters[index];
      hash = (hash * prime + index) % mod;

      return hashId;
    }, "");
  }

  /**
   * 뉴스 기사에 대한 검색 키워드를 추가합니다.
   * @param {string[]} keywords - 추가할 검색 키워드 항목
   */
  addSearchKeyword(keywords) {
    this._keywords = [...this._keywords, ...keywords];
  }

  /**
   * 뉴스 기사의 고유한 해시 ID값을 반환합니다.
   * @returns {string} 뉴스 기사의 해시 ID값
   */
  get hashId() {
    return this._hashId;
  }

  /**
   * 뉴스 기사에 대한 검색 키워드 목록을 반환합니다.
   * @returns {string[]} 뉴스 기사의 검색 키워드 목록
   */
  get keywords() {
    return [...this._keywords];
  }

  /**
   * 뉴스 기사가 게재된 시각을 반환합니다.
   * @returns {Date} 뉴스 기사의 게재 시각
   */
  get pubDate() {
    return this._pubDate;
  }

  /**
   * 뉴스 기사의 데이터를 반환합니다.
   * @typedef {Object} NewsItemData
   * @property {string} title - 기사 제목
   * @property {string} link - 기사 링크
   * @property {string} source - 기사 출처
   * @property {string} description - 기사 설명
   * @property {string} pubDateText - 기사 발행일 문자열
   * @property {string[]} keywords - 기사 검색어 목록
   * @returns {NewsItemData}
   */
  get data() {
    return {
      title: this._title,
      link: this._link,
      source: this._source,
      description: this._description,
      pubDateText: Utilities.formatDate(this._pubDate, "GMT+9", "yyyy-MM-dd HH:mm:ss"),
      keywords: this.keywords,
    };
  }

  /**
   * 뉴스 기사의 데이터를 아카이빙용 포맷으로 반환합니다.
   * @returns {string[]}
   */
  get archivingData() {
    const { pubDateText, title, source, link, description, keywords } = this.data;
    return [pubDateText, title, source, link, description, keywords.join(", ")];
  }
}

/**
 * NewsItem 항목들을 관리하는 맵 클래스입니다.
 */
class NewsItemMap {
  /**
   * NewsItemMap 클래스의 생성자입니다.
   */
  constructor() {
    this._newsItemsMap = new Map();
  }

  /**
   * 뉴스 항목을 맵에 추가합니다. 이미 존재하는 항목의 경우 검색 키워드만 업데이트합니다.
   * @param {NewsItem} newsItem - 추가할 뉴스 항목
   */
  addNewsItem(newsItem) {
    const existingItem = this._newsItemsMap.get(newsItem.hashId);
    if (existingItem) {
      existingItem.addSearchKeyword(newsItem.keywords);
      return;
    }

    this._newsItemsMap.set(newsItem.hashId, newsItem);
  }

  /**
   * 여러 뉴스 항목을 한 번에 맵에 추가합니다.
   * @param {NewsItem[]} newsItems - 추가할 뉴스 항목 배열
   */
  addNewsItems(newsItems) {
    newsItems.forEach((newsItem) => this.addNewsItem(newsItem));
  }

  /**
   * 맵에 저장된 모든 뉴스 항목을 조건에 따라 정렬된 배열로 반환합니다.
   * @param {Object} params - 정렬 조건
   * @param {boolean} [params.sortByDesc] - 시간 역순 정렬 여부
   * @returns {NewsItem[]} 모든 뉴스 항목의 정렬된 배열
   */
  getNewsItems({ sortByDesc }) {
    if (this._newsItemsMap.size === 0) {
      return [];
    }

    const compareFunction = sortByDesc ? (a, b) => b.pubDate - a.pubDate : (a, b) => a.pubDate - b.pubDate;

    return [...this._newsItemsMap.values()].sort(compareFunction);
  }

  /**
   * 맵에 저장된 모든 뉴스 항목의 해시 ID를 배열로 반환합니다.
   * @returns {string[]} 모든 뉴스 항목의 해시 ID 배열
   */
  get newsHashIds() {
    return [...this._newsItemsMap.keys()];
  }

  /**
   * 맵에 저장된 뉴스 항목의 개수를 반환합니다.
   * @returns {number} 저장된 뉴스 항목의 개수
   */
  get size() {
    return this._newsItemsMap.size;
  }

  /**
   * 맵에 저장된 뉴스 항목들로부터 가장 최근의 pubDate를 추출합니다.
   * @returns {Date|null} 가장 최근의 pubDate, 만약 Map이 비어있을 경우는 null
   */
  get latestNewsPubDate() {
    if (this._newsItemsMap.size === 0) return null;
    return [...this._newsItemsMap.values()].reduce(
      (latest, newsItem) => (newsItem.pubDate > latest ? newsItem.pubDate : latest),
      new Date(0),
    );
  }

  /**
   * 맵에 저장된 모든 뉴스 항목을 제거합니다.
   */
  clear() {
    this._newsItemsMap.clear();
  }
}

/**
 * BaseNewsService는 뉴스 관련 서비스들의 기본 클래스로, 뉴스 데이터 관리를 위한 공통 기능을 제공합니다.
 * FetchingService, MessagingService, ArchivingService가 이 클래스를 상속받아 사용합니다.
 */
class BaseNewsService {
  /**
   * BaseNewsService의 생성자입니다.
   * NewsItemMap 인스턴스를 초기화합니다.
   */
  constructor() {
    /**
     * 뉴스 아이템들을 저장하고 관리하는 NewsItemMap 인스턴스입니다.
     * @protected
     * @type {NewsItemMap}
     */
    this._newsItems = new NewsItemMap();
  }

  /**
   * 저장된 뉴스 아이템들을 반환합니다.
   * @param {Object} options - 정렬 옵션
   * @param {boolean} [options.sortByDesc] - true일 경우 내림차순으로 정렬
   * @returns {NewsItem[]} 뉴스 아이템 배열
   */
  getNewsItems({ sortByDesc }) {
    return this._newsItems.getNewsItems({ sortByDesc });
  }

  /**
   * 저장된 뉴스 아이템들의 해시 ID 배열을 반환합니다.
   * @returns {string[]} 뉴스 아이템 해시 ID 배열
   */
  get newsHashIds() {
    return this._newsItems.newsHashIds;
  }

  /**
   * 저장된 뉴스 아이템 중 가장 최근의 발행 날짜를 반환합니다.
   * @returns {Date|null} 가장 최근 뉴스의 발행 날짜, 또는 뉴스가 없는 경우 null
   */
  get latestNewsPubDate() {
    return this._newsItems.latestNewsPubDate;
  }

  /**
   * 저장된 뉴스 아이템의 개수를 반환합니다.
   * @returns {number} 뉴스 아이템 개수
   */
  get newsItemsSize() {
    return this._newsItems.size;
  }
}

/**
 * FetchingService는 네이버 오픈 API를 통해 검색어가 포함된 뉴스 기사를 가져와 처리합니다.
 */
class FetchingService extends BaseNewsService {
  /**
   * FetchingService 클래스의 생성자입니다.
   * @param {Object} params - 생성자 매개변수
   * @param {string} params.apiUrl - 네이버 뉴스 검색 API URL
   * @param {string} params.clientId - 네이버 API 클라이언트 ID
   * @param {string} params.clientSecret - 네이버 API 클라이언트 시크릿
   * @param {Object} params.newsSource - 뉴스 소스 목록
   * @param {string[]} lastDeliveredNewsHashIds - 마지막으로 전송 완료된 뉴스 항목들의 해시 ID 배열
   * @param {Date} lastDeliveredNewsPubDate - 마지막으로 전송 완료된 뉴스 항목의 게재 시각
   */
  constructor({ apiUrl, clientId, clientSecret, newsSource, lastDeliveredNewsHashIds, lastDeliveredNewsPubDate }) {
    super();
    this._apiUrl = apiUrl;
    this._fetchOptions = {
      method: "get",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    };
    this._newsSourceFinder = new NewsSourceFinder(newsSource);
    this._lastDeliveredNewsHashIds = [...lastDeliveredNewsHashIds];
    this._lastDeliveredNewsPubDate = lastDeliveredNewsPubDate;
  }

  /**
   * 검색어들이 포함된 최신 뉴스 항목들을 가져옵니다.
   * @param {Object} params - 최신 뉴스 검색 옵션
   * @param {string[]} params.searchKeywords - 검색어 목록
   * @param {number} [params.display] - 각 검색어별 뉴스 검색 수
   * @param {boolean} [params.sortByDesc] - 뉴스 항목들의 시간 역순 정렬 여부
   * @returns {NewsItem[]} 새로 가져온 뉴스 항목들
   */
  fetchNewsItems({ searchKeywords, display, sortByDesc }) {
    searchKeywords.forEach((searchKeyword) => {
      this._fetchNewsItemsForEachKeyword({ searchKeyword, display });
    });

    return this.getNewsItems({ sortByDesc });
  }

  /**
   * 단일 검색어에 대한 뉴스 항목들을 가져옵니다.
   * @param {Object} params - 단일 검색어 뉴스 검색 옵션
   * @param {string} params.searchKeyword - 검색어
   * @param {number} [params.display] - 검색어에 대한 뉴스 검색 수
   * @private
   */
  _fetchNewsItemsForEachKeyword({ searchKeyword, display }) {
    const fetchUrl = this._createFetchUrl({ searchKeyword, display });
    const fetchedNewsItems = this._fetchNewsItemsFromAPI(fetchUrl);
    if (fetchedNewsItems.length === 0) return;

    const newsItems = fetchedNewsItems
      .map((newsItem) => this._createNewsItem({ newsItem, searchKeyword }))
      .filter(
        (newsItem) =>
          !this._lastDeliveredNewsHashIds.includes(newsItem.hashId) &&
          this._isAfterLatestNewsItem({ newsPubDate: newsItem.pubDate }),
      );
    if (newsItems.length === 0) return;

    this._newsItems.addNewsItems(newsItems);
  }

  /**
   * API에서 데이터를 가져오고 파싱합니다.
   * @param {string} fetchUrl - API 요청 URL
   * @returns {Object[]} 파싱된 JSON 응답 데이터
   * @throws {Error} API 요청이 실패하거나 응답 코드가 200번대가 아닐 경우
   * @private
   */
  _fetchNewsItemsFromAPI(fetchUrl) {
    const fetchedData = UrlFetchApp.fetch(fetchUrl, this._fetchOptions);
    const fetchedDataResponseCode = fetchedData.getResponseCode();
    if (fetchedDataResponseCode < 200 || fetchedDataResponseCode > 299) {
      throw new Error(fetchedData.getContentText());
    }

    return JSON.parse(fetchedData).items || [];
  }

  /**
   * 뉴스 기사의 발행일이 지정된 시간 이후인지 확인합니다.
   * @param {Object} params - 매개변수
   * @param {Date} newsPubDate - 뉴스 게재 시각
   * @param {number} [subsetTime] - 발행일 기준 시각에서 추가로 뺄 밀리초 단위 시간 (선택)
   * @returns {boolean} 뉴스 기사의 발행일이 지정된 시간 이후인 경우 true, 그렇지 않은 경우 false
   */
  _isAfterLatestNewsItem({ newsPubDate, subsetTime }) {
    const subsetTimeAmount = subsetTime && !Number.isNaN(subsetTime) ? subsetTime : 0;
    return newsPubDate.getTime() >= this._lastDeliveredNewsPubDate.getTime() - subsetTimeAmount;
  }

  /**
   * 뉴스 항목 객체를 생성합니다.
   * @param {Object} params - 매개변수
   * @param {Object} params.newsItem - API로부터 받아온 뉴스 항목 데이터
   * @param {string} params.searchKeyword - 해당 뉴스 항목의 검색어
   * @returns {NewsItem} 생성된 NewsItem 객체
   * @private
   */
  _createNewsItem({ newsItem, searchKeyword }) {
    return new NewsItem({
      title: getBleachedText(newsItem.title),
      link: newsItem.link,
      source: this._newsSourceFinder.getSourceByLink(newsItem.originallink),
      description: getBleachedText(newsItem.description),
      pubDate: new Date(newsItem.pubDate),
      keyword: searchKeyword,
    });
  }

  /**
   * API 요청을 위한 URL을 생성합니다.
   * @param {Object} params - 매개변수
   * @param {string} params.searchKeyword - 검색어
   * @param {number} [params.startIndex=1] - 검색 시작 인덱스
   * @param {number} [params.display=100] - 한 번에 가져올 뉴스 항목 수
   * @returns {string} 생성된 API 요청 URL
   * @private
   */
  _createFetchUrl({ searchKeyword, startIndex = 1, display = 100 }) {
    const searchParams = objectToQueryParams({
      query: searchKeyword,
      start: startIndex,
      display,
      sort: "date",
    });

    return `${this._apiUrl}?${searchParams}`;
  }
}

/**
 * 다양한 채널로 메시지와 뉴스 아이템을 전송하는 서비스 클래스입니다.
 */
class MessagingService extends BaseNewsService {
  /**
   * MessagingService 클래스의 생성자입니다.
   * @param {Object} params - 설정 객체
   * @param {Object.<string, string>} params.webhooks - 채널별 웹훅 URL 객체
   * @param {Object} params.newsCardGenerator - 뉴스 카드 생성기 객체
   * @param {Object} params.messageGenerator - 메시지 생성기 객체
   */
  constructor({ webhooks, newsCardGenerator, messageGenerator }) {
    super();
    this._webhooks = { ...webhooks };
    this._newsCardGenerator = newsCardGenerator;
    this._messageGenerator = messageGenerator;
    this._defaultParams = {
      method: "post",
      contentType: "application/json",
    };
  }

  /**
   * 여러 채널로 뉴스를 전송하고, 전송 완료된 뉴스 항목을 저장합니다.
   * @param {NewsItem[]} newsItems - 전송할 뉴스 아이템 배열
   */
  sendNewsItems(newsItems) {
    newsItems.forEach(async (newsItem) => {
      this._sendNewsItemToChannels(newsItem);
      this._newsItems.addNewsItem(newsItem);

      // 채팅 솔루션별 초당/분당 request 횟수 제한을 고려하여 다음 항목 처리 전에 일시 중지 시간을 부여합니다.
      await sleep(50);
    });
  }

  /**
   * 여러 채널로 개별 뉴스 아이템을 전송합니다.
   * @param {NewsItem} newsItem - 전송할 뉴스 아이템
   * @private
   */
  _sendNewsItemToChannels(newsItem) {
    Object.entries(this._webhooks).forEach(([channel, webhookUrl]) => {
      const payload = this._newsCardGenerator[toCamelCase(channel)](newsItem.data);
      this._sendToChannel({ channel, webhookUrl, payload });
    });
  }

  /**
   * 여러 채널로 메시지를 전송합니다.
   * @param {string} message - 전송할 메시지
   */
  sendMessage(message) {
    Object.entries(this._webhooks).forEach(([channel, webhookUrl]) => {
      const payload = this._messageGenerator[toCamelCase(channel)](message);
      this._sendToChannel({ channel, webhookUrl, payload });
    });
  }

  /**
   * 특정 채널로 페이로드를 전송합니다.
   * @param {Object} params - 매개변수 객체
   * @param {string} params.channel - 채널 이름
   * @param {string} params.webhookUrl - 웹훅 URL
   * @param {Object} params.payload - 전송할 페이로드
   * @private
   */
  _sendToChannel({ channel, webhookUrl, payload }) {
    const params = {
      ...this._defaultParams,
      payload: JSON.stringify(payload),
    };

    if (channel === "JANDI") {
      params.header = {
        Accept: "application/vnd.tosslab.jandi-v2+json",
      };
    }

    const fetchResponse = UrlFetchApp.fetch(webhookUrl, params);
    const fetchResponseCode = fetchResponse.getResponseCode();
    if (fetchResponseCode < 200 || fetchResponseCode > 299) {
      throw new Error(fetchResponse.getContentText());
    }
  }
}

/**
 * 뉴스 아이템을 구글 시트에 저장하는 서비스 클래스입니다.
 */
class ArchivingService extends BaseNewsService {
  /**
   * ArchivingService 클래스의 생성자입니다.
   * @param {Object} params - 생성자 매개변수
   * @param {Object} params.config - 구글 시트 설정 정보
   * @param {string} params.config.URL - 스프레드시트 URL
   * @param {string} params.config.NAME - 워크시트 이름
   */
  constructor({ config }) {
    super();
    this._config = { ...config };
    this._spreadSheet = this._getSpreadSheet(this._config.URL);
    this._workSheet = this._getOrCreateWorkSheet(this._config.NAME || "뉴스피드");
    this._workSheetTargetCell = `${this._config.NAME}!A2`;
  }

  /**
   * 스프레드시트 객체를 가져옵니다.
   * @param {string} spreadSheetUrl - 스프레드시트 문서 URL
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} 스프레드시트 객체
   * @private
   */
  _getSpreadSheet(spreadSheetUrl) {
    try {
      const spreadSheetId = getSpreadSheetId(spreadSheetUrl);
      return SpreadsheetApp.openById(spreadSheetId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * 워크시트를 가져오거나 새로 생성합니다.
   * @param {string} workSheetName - 워크시트 이름
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} 워크시트 객체
   * @private
   */
  _getOrCreateWorkSheet(workSheetName) {
    const existingSheet = this._spreadSheet.getSheetByName(workSheetName);
    if (existingSheet) {
      return existingSheet;
    }
    return this._createNewWorkSheet(workSheetName);
  }

  /**
   * 새 워크시트를 생성합니다.
   * @param {string} workSheetName - 생성할 워크시트 이름
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} 새로 생성된 워크시트 객체
   * @private
   */
  _createNewWorkSheet(workSheetName) {
    try {
      const newWorkSheet = this._spreadSheet.insertSheet(workSheetName, 1);

      const headerRange = Sheets.newValueRange();
      headerRange.values = [["날짜/시각", "제목", "매체명", "URL", "내용", "검색어"]];
      const headerTargetCell = `${workSheetName}!A1`;

      Sheets.Spreadsheets.Values.update(headerRange, this._spreadSheet.getId(), headerTargetCell, {
        valueInputOption: "RAW",
      });

      return newWorkSheet;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * 뉴스 아이템들을 구글 시트에 저장합니다.
   * @param {NewsItem[]} newsItems - 저장할 뉴스 아이템들 데이터
   */
  archiveNewsItems(newsItems) {
    try {
      this._workSheet.insertRowsBefore(2, newsItems.length);
      const valueRange = Sheets.newValueRange();
      valueRange.values = newsItems.map((newsItem) => newsItem.archivingData);

      Sheets.Spreadsheets.Values.update(valueRange, this._spreadSheet.getId(), this._workSheetTargetCell, {
        valueInputOption: "USER_ENTERED",
      });

      this._newsItems.addNewsItems(newsItems);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

/**
 * NewsSourceFinder 클래스는 뉴스 매체명을 관리하고 탐색하는 기능을 제공합니다.
 */
class NewsSourceFinder {
  /**
   * NewsSources 객체를 생성합니다.
   * @param {Object} newsSource - 뉴스 소스 목록
   */
  constructor(newsSource) {
    this._sources = Object.entries(newsSource).sort((a, b) => a[0].localeCompare(b[0]));
  }

  /**
   * 원본 링크에서 뉴스 소스를 찾아 반환합니다.
   * @param {string} originalLink - 원본 링크
   * @returns {string} 찾은 뉴스 소스 (찾지 못한 경우 도메인 또는 "(알수없음)" 반환)
   */
  getSourceByLink(originalLink) {
    const address = this._extractAddress(originalLink);
    const domain = this._extractDomainFromAddress(address);

    if (!domain) {
      return "(알수없음)";
    }

    const index = this._findSourceIndexFromAddress(address);

    return index !== -1 ? this._sources[index][1] : domain;
  }

  /**
   * 주어진 주소(address)에서 도메인을 추출하여 반환합니다.
   * @param {string} address - 도메인을 추출할 주소 정보
   * @returns {string|null} 추출된 도메인 (도메인이 없는 경우 null 반환)
   * @private
   */
  _extractDomainFromAddress(address) {
    const domain = address.match(/^([^:\/\n\?\=]+)/);
    return domain ? domain[0] : null;
  }

  /**
   * URL에서 프로토콜(http/https) 정보 및 일부 서브 도메인 등 불필요한 요소를 제거한 주소를 반환합니다.
   * @param {string} url - 주소를 추출할 URL
   * @returns {string} 추출된 주소
   * @private
   */
  _extractAddress(url) {
    return url
      .toLowerCase()
      .replace(
        /^(https?:\/?\/?)?(\/?\/?www\.)?(\/?\/?news\.)?(\/?\/?view\.)?(\/?\/?post\.)?(\/?\/?photo\.)?(\/?\/?photos\.)?(\/?\/?blog\.)?/,
        "",
      );
  }

  /**
   * 이진 탐색을 사용하여 뉴스 소스의 인덱스를 찾습니다.
   * @param {string} address - 도메인을 탐색할 뉴스 주소 정보
   * @returns {number} 찾은 뉴스 소스의 인덱스 (찾지 못한 경우 -1 반환)
   * @private
   */
  _findSourceIndexFromAddress(address) {
    let left = 0;
    let right = this._sources.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const source = this._sources[mid];
      const sourceUrl = source[0];

      if (address.startsWith(sourceUrl)) {
        return this._findSubpathIndex({ address, index: mid });
      }

      if (address < sourceUrl) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return -1;
  }

  /**
   * 하위 경로를 확인하여 최종 뉴스 소스의 인덱스를 찾습니다.
   * @param {Object} params - 탐색 매개변수
   * @param {string} params.address - 검색할 주소 정보
   * @param {number} params.index - 시작 인덱스
   * @returns {number} 최종 뉴스 소스의 인덱스
   * @private
   */
  _findSubpathIndex({ address, index }) {
    let subpathIndex = index;

    while (subpathIndex + 1 < this._sources.length && address.startsWith(this._sources[subpathIndex + 1][0])) {
      subpathIndex += 1;
    }

    return subpathIndex;
  }
}
/**
 * 각 메신저별 뉴스 전송용 메시지 카드 레이아웃을 생성하는 유틸리티 객체입니다.
 * @typedef {Object} NewsCardGenerator
 * @property {function(Object): Object} slack - Slack용 뉴스 카드 객체 생성 함수
 * @property {function(Object): Object} jandi - JANDI용 뉴스 카드 객체 생성 함수
 * @property {function(Object): Object} googleChat - Google Chat용 뉴스 카드 객체 생성 함수
 * @property {function(Object): Object} discord - Discord용 뉴스 카드 객체 생성 함수
 */
const NewsCardGenerator = {
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
   * @param {string} params.title - 뉴스 제목
   * @param {string} params.link - 뉴스 링크 URL
   * @param {string} params.source - 뉴스 출처
   * @param {string} params.description - 뉴스 설명
   * @param {string} params.pubDateText - 발행일 텍스트
   * @param {string[]} params.keywords - 뉴스에 해당하는 검색어 목록
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

  /**
   * 디스코드용 뉴스 카드를 생성합니다.
   * @param {Object} params - 뉴스 항목 정보
   * @param {string} params.title - 뉴스 제목
   * @param {string} params.link - 뉴스 링크 URL
   * @param {string} params.source - 뉴스 출처
   * @param {string} params.description - 뉴스 설명
   * @param {string} params.pubDateText - 발행일 텍스트
   * @param {string[]} params.keywords - 뉴스에 해당하는 검색어 목록
   * @returns {Object} 디스코드 메시지 카드 객체
   */
  discord: ({ title, link, source, description, pubDateText, keywords }) => {
    return {
      username: "네이버 뉴스봇",
      embeds: [
        {
          author: {
            name: source,
          },
          title,
          url: link,
          description,
          color: 15258703,
          fields: [
            {
              name: "게재시각",
              value: pubDateText,
              inline: true,
            },
            {
              name: "검색어",
              value: keywords.join(", "),
              inline: true,
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
 * @property {function(Object): Object} discord - Discord용 뉴스 카드 객체 생성 함수
 */
const MessageGenerator = {
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

  /**
   * 디스코드용 일반 메시지를 생성합니다.
   * @param {string} message - 전송할 메시지 내용
   * @returns {Object} 디스코드 메시지 객체
   */
  discord: (message) => {
    return {
      username: "네이버 뉴스봇",
      content: message,
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
function createWelcomeMessage(searchKeywords) {
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
function createKeywordsChangedMessage(before, after) {
  return `[네이버 뉴스 봇 키워드 변경 완료]\n\n뉴스 검색 키워드가 '${before}'에서 '${after}'로 변경되었습니다.`;
}
/**
 * 설정값 유효성 검사 중 발생하는 오류를 나타내는 사용자 정의 에러 클래스입니다.
 * @extends Error
 */
class ConfigValidationError extends Error {
  /**
   * ConfigValidationError 생성자
   * @param {string} message - 오류 메시지
   */
  constructor(message) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

/**
 * GAS 환경에 설정된 Property를 다룰 때 발생하는 오류를 나타내는 사용자 정의 에러 클래스입니다.
 * @extends Error
 */
class PropertyError extends Error {
  /**
   * PropertyError 생성자
   * @param {string} message - 오류 메시지
   */
  constructor(message) {
    super(message);
    this.name = "PropertyError";
  }
}

/**
 * 뉴스 수신 중 발생한 오류에 대한 사용자 정의 에러 클래스입니다.
 * @extends Error
 */
class NewsFetchError extends Error {
  /**
   * NewsFetchError 생성자
   * @param {string} message - 오류 메시지
   */
  constructor(message) {
    super(message);
    this.name = "NewsFetchError";
  }
}

/**
 * 뉴스봇 초기화 구동 중 발생한 오류에 대한 사용자 정의 에러 클래스입니다.
 * @extends Error
 */
class InitializationError extends Error {
  /**
   * InitializationError 생성자
   * @param {string} message - 오류 메시지
   */
  constructor(message) {
    super(message);
    this.name = "InitializationError";
  }
}

/**
 * GAS의 PropertiesService를 사용하여 속성값을 관리하는 유틸리티 객체입니다.
 * @typedef {Object} PropertyManager
 * @property {function(string): string|null} getProperty - 지정된 하나의 속성값을 가져오는 함수
 * @property {function(string, string): void} setProperty - 지정된 속성값을 설정하고 저장하는 함수
 */
const PropertyManager = {
  /**
   * PropertiesService 객체에서 지정된 속성값을 가져옵니다.
   * @param {string} property - 가져올 속성의 이름
   * @returns {string|null} 속성값이 존재하면 해당 값을 반환하고, 그렇지 않으면 null을 반환
   */
  getProperty: (property) => {
    try {
      return PropertiesService.getScriptProperties().getProperty(property);
    } catch (error) {
      throw new PropertyError(`'${property}' 속성값을 불러오지 못했습니다.\n에러 원문 메시지 : ${error.message}`);
    }
  },

  /**
   * PropertiesService 객체에 지정된 속성값을 저장합니다.
   * @param {string} property - 저장할 속성의 이름
   * @param {string} value - 저장할 속성의 값
   * @returns {void}
   */
  setProperty: (property, value) => {
    try {
      PropertiesService.getScriptProperties().setProperty(property, value);
    } catch (error) {
      throw new PropertyError(`'${property}' 속성값을 저장하지 못했습니다.\n에러 원문 메시지 : ${error.message}`);
    }
  },
};

/**
 * 주어진 텍스트에 포함된 Entity들 가운데 HTML Tag 요소들을 제거하고 원래 의도된 특수문자로 대체한 뒤 반환합니다.
 * @param {string} text - 기사 제목/요약문 텍스트
 * @returns {string} 일부 특수문자가 처리된 기사 제목/요약문 텍스트
 */
function getBleachedText(text) {
  return text
    .replace(/(<([^>]+)>)/gi, "")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/`/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/^= /, "");
}

/**
 * UPPER_CASE로 작성된 텍스트를 camelCase로 수정합니다.
 * @param {string} text - UPPER_CASE 텍스트
 * @returns {string} camelCase 형식으로 수정된 텍스트
 */
function toCamelCase(text) {
  return text.toLowerCase().replace(/_(.)/g, (_, c) => c.toUpperCase());
}

/**
 * string[] 타입의 두 배열이 순서 구분 없이 서로 동일한 크기와 내용을 가졌는지 검증합니다.
 * @param {string[]} arrayA - A 배열
 * @param {string[]} arrayB - B 배열
 * @returns {boolean} 두 배열의 비교 결과값
 */
function isTwoArraysEqual(arrayA, arrayB) {
  if (arrayA === arrayB) return true;
  if (arrayA === null || arrayB === null || arrayA.length !== arrayB.length) return false;

  const sortedArrayA = [...arrayA].sort();
  const sortedArrayB = [...arrayB].sort();

  return sortedArrayA.every((item, index) => item === sortedArrayB[index]);
}

/**
 * key-value 타입으로 작성된 객체를 query string 포맷으로 변환합니다.
 * @param {Record<string, T>} params - Query에 담을 내용
 * @returns {string} Query string 값
 */
function objectToQueryParams(params) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

/**
 * 주어진 URL에서 Google SpreadSheet ID값을 추출하여 반환합니다.
 * @param {string} sheetUrl - Google SpreadSheet 공유용 URL string 전체
 * @returns {string|null} 추출된 ID값 (없을 경우 null)
 */
function getSpreadSheetId(sheetUrl) {
  const urlPattern = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/;
  const matchedPattern = sheetUrl.match(urlPattern);

  if (!matchedPattern) return null;
  return matchedPattern[1];
}

/**
 * 지정된 시간 동안 코드 실행을 일시 중지합니다.
 * @param {number} ms - 일시 중지할 시간 (밀리초 단위)
 * @returns {Promise<void>} 지정된 시간이 경과한 후 resolve되는 Promise
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 뉴스봇 구동 설정값을 검증합니다.
 * @param {Object} config - 뉴스봇 구동 설정값 객체
 * @throws {ConfigValidationError} 설정값 검증 실패시 에러 반환
 */
function validateConfig(config) {
  if (typeof config !== "object" || config === null) {
    throw new ConfigValidationError("설정값 객체(CONFIG)가 존재하지 않습니다.");
  }

  if (typeof config.DEBUG !== "boolean") {
    throw new ConfigValidationError("디버그 모드(DEBUG) 설정값은 true 혹은 false여야 합니다.");
  }

  if (!Array.isArray(config.KEYWORDS) || config.KEYWORDS.length === 0) {
    throw new ConfigValidationError("검색어 목록(KEYWORDS)에는 최소 하나 이상의 검색어를 포함해야 합니다.");
  }
  if (config.KEYWORDS.length > 5) {
    throw new ConfigValidationError("검색어 목록(KEYWORDS)에 포함된 검색어는 최대 5개까지만 허용됩니다.");
  }
  config.KEYWORDS.forEach((keyword, index) => {
    if (typeof keyword !== "string" || keyword.trim() === "") {
      throw new ConfigValidationError(
        `검색어 목록(KEYWORDS)의 ${index + 1}번째 검색어는 반드시 글자가 포함된 문자여야 합니다.`,
      );
    }
  });

  if (typeof config.NAVER_API_CLIENT !== "object" || config.NAVER_API_CLIENT === null) {
    throw new ConfigValidationError(
      "네이버 검색 오픈 API 설정값(NAVER_API_CLIENT)은 반드시 객체 형태로 작성되어야 합니다.",
    );
  }
  if (typeof config.NAVER_API_CLIENT.ID !== "string" || config.NAVER_API_CLIENT.ID.trim() === "") {
    throw new ConfigValidationError("네이버 검색 오픈 API의 Client ID(NAVER_API_CLIENT.ID)값이 비어 있습니다.");
  }
  if (typeof config.NAVER_API_CLIENT.SECRET !== "string" || config.NAVER_API_CLIENT.SECRET.trim() === "") {
    throw new ConfigValidationError("네이버 검색 오픈 API의 Secret(NAVER_API_CLIENT.SECRET)값이 비어 있습니다.");
  }

  if (typeof config.WEBHOOK !== "object" || config.WEBHOOK === null) {
    throw new ConfigValidationError("웹훅 주소 설정값(WEBHOOK)은 반드시 객체 형태로 작성되어야 합니다.");
  }
  Object.keys(config.WEBHOOK).forEach((service) => {
    if (typeof config.WEBHOOK[service] !== "object" || config.WEBHOOK[service] === null) {
      throw new ConfigValidationError(`웹훅 주소 설정값(WEBHOOK) 안의 "${service}" 설정값은 객체 형태여야 합니다.`);
    }
    if (typeof config.WEBHOOK[service].IS_ENABLED !== "boolean") {
      throw new ConfigValidationError(
        `웹훅 주소 설정값(WEBHOOK) 안의 ${service}.IS_ENABLED 값은 true 혹은 false여야 합니다.`,
      );
    }
    if (typeof config.WEBHOOK[service].URL !== "string") {
      throw new ConfigValidationError(
        `웹훅 주소 설정값(WEBHOOK) 안의 ${service}.URL 값은 웹훅의 url 주소가 담겨있거나 비어있는("") 문자열 형태여야 합니다.`,
      );
    }
  });

  if (typeof config.ARCHIVING !== "object" || config.ARCHIVING === null) {
    throw new ConfigValidationError("뉴스 저장 설정값(ARCHIVING)은 반드시 객체 형태로 작성되어야 합니다.");
  }
  if (typeof config.ARCHIVING.IS_ENABLED !== "boolean") {
    throw new ConfigValidationError("뉴스 저장 여부 설정값(ARCHIVING.IS_ENABLED)은 true 혹은 false여야 합니다.");
  }
  if (typeof config.ARCHIVING.SHEET_INFO !== "object" || config.ARCHIVING.SHEET_INFO === null) {
    throw new ConfigValidationError(
      "뉴스를 저장할 구글 시트 정보(ARCHIVING.SHEET_INFO)의 설정값은 객체 형태여야 합니다.",
    );
  }
  Object.keys(config.ARCHIVING.SHEET_INFO).forEach((field) => {
    if (typeof config.ARCHIVING.SHEET_INFO[field] !== "string") {
      throw new ConfigValidationError(
        `뉴스 저장용 구글 시트 정보(ARCHIVING.SHEET_INFO)에 포함된 ${field} 설정값은 해당 정보가 담겨있거나 비어있는("") 문자열 형태여야 합니다.`,
      );
    }
  });

  if (Object.values(config.WEBHOOK).every(({ IS_ENABLED, _ }) => !IS_ENABLED) && !config.ARCHIVING.IS_ENABLED) {
    throw new ConfigValidationError(
      "뉴스 항목을 전송할 웹훅 사용 여부(CONFIG.WEBHOOK.*.IS_ENABLED)와 뉴스 항목 저장 여부(CONFIG.ARCHIVING.IS_ENABLED) 가운데 최소 1가지 이상은 true여야 합니다.",
    );
  }
}
