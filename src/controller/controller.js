import { NewsItem } from "../domain/domain";
import { FetchingService, MessagingService, ArchivingService } from "../service/service";
import { PropertyManager, isTwoArraysEqual, validateConfig } from "../util/util";
import { NewsFetchError, InitializationError } from "../util/error";
import { NewsCardGenerator, MessageGenerator } from "../util/template";

import CONFIG from "../user/config";
import NEWS_SOURCE from "../user/newsSource";

/**
 * 뉴스봇 컨트롤러 클래스입니다.
 */
export default class NewsFetchingBotController {
  /**
   * NewsFetchingBotController의 생성자입니다.
   */
  constructor() {
    validateConfig(CONFIG);

    const { searchKeywords, lastDeliveredNewsHashIds, lastDeliveredNewsPubDate, isFirstRun } =
      this._getControllerProperties();

    this._searchKeywords = searchKeywords || [...CONFIG.KEYWORDS];
    this._lastDeliveredNewsHashIds = lastDeliveredNewsHashIds;
    this._lastDeliveredNewsPubDate = lastDeliveredNewsPubDate || new Date().getTime();
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
      isEnabled: CONFIG.ARCHIVING.IS_ENABLED,
      sheetInfo: CONFIG.ARCHIVING.SHEET_INFO,
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

      this._deliverSampleNews();
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
   * 뉴스 데이터를 새로 받아온 뒤 채팅 서비스로 전송합니다.
   */
  deliverNewsItems() {
    try {
      if (!this._isWebhookConfigured()) {
        Logger.log("[INFO] 뉴스를 전송할 채팅 서비스가 설정되어 있지 않습니다. 다음 단계로 넘어갑니다.");
        return;
      }

      const fetchedNewsItems = this._fetchingService.getNewsItems({ sortByDesc: false });

      this._sendNewsItems(fetchedNewsItems);
      Logger.log("[SUCCESS] 뉴스 항목 전송이 완료되었습니다.");
    } catch (error) {
      Logger.log(
        `[ERROR] 뉴스 항목 전송 중 오류가 발생했습니다. 현재 작업을 종료하고 다음 단계로 넘어갑니다.\n오류 내용: ${error.message}`,
      );
    }
  }

  /**
   * 인자로 받은 뉴스 항목들을 채팅 서비스로 전송합니다.
   * @param {NewsItem[]} newsItems - 전송할 뉴스 항목들
   * @private
   */
  _sendNewsItems(newsItems) {
    if (newsItems.length === 0) {
      Logger.log("[INFO] 전송할 새 뉴스 항목이 없습니다.");
      return;
    }

    this._messagingService.sendNewsItems(newsItems);
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
   * 뉴스봇 스크립트 설치 과정에서 샘플 뉴스를 받아 전송합니다.
   * @private
   */
  _deliverSampleNews() {
    const sampleNewsItems = this._fetchingService.fetchNewsItems({
      searchKeywords: this._searchKeywords,
      display: 1,
      filterByPubDate: false,
    });

    if (sampleNewsItems.length <= 0) {
      Logger.log("[INFO] 등록된 키워드로 기존에 게재된 뉴스가 아직 없습니다. 뉴스봇 설치를 계속 진행합니다.");
      return;
    }

    const sampleNewsDeliverMessage =
      "등록된 키워드별 샘플 뉴스를 전송합니다. 만약 기존에 게재된 뉴스가 아직 없다면 별도로 표시되지 않습니다.";
    Logger.log(`[INFO] ${sampleNewsDeliverMessage}`);
    this._messagingService.sendMessage(`[네이버 뉴스봇] ${sampleNewsDeliverMessage}`);

    this._printFetchedNewsItems(sampleNewsItems);

    if (!CONFIG.DEBUG) {
      this._sendNewsItems(sampleNewsItems);
    }
  }

  /**
   * 뉴스봇의 첫 구동때 설정된 초기 설정값을 저장합니다.
   * @private
   */
  _saveInitialProperties() {
    this.savePropertiesWithParams({
      searchKeywords: this._searchKeywords,
      lastDeliveredNewsHashIds: this._fetchingService.newsHashIds,
      lastDeliveredNewsPubDate: this._fetchingService.latestNewsPubDate ?? this._lastDeliveredNewsPubDate,
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
