/**
 * NewsFetchService는 네이버 오픈 API를 통해 검색어가 포함된 뉴스 기사를 가져와 처리합니다.
 */
class NewsFetchService {
  /**
   * NewsFetchService 클래스의 생성자입니다.
   * @param {Object} params - 생성자 매개변수
   * @param {string} params.apiUrl - 네이버 뉴스 검색 API URL
   * @param {string} params.clientId - 네이버 API 클라이언트 ID
   * @param {string} params.clientSecret - 네이버 API 클라이언트 시크릿
   * @param {Object} params.newsSource - 뉴스 소스 목록
   * @param {string[]} params.lastFetchedNewsItems - 가장 최근에 처리된 뉴스 항목들의 해시 ID 배열
   */
  constructor({ apiUrl, clientId, clientSecret, newsSource, lastFetchedNewsItems }) {
    this._apiUrl = apiUrl;
    this._fetchOptions = {
      method: "get",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    };
    this._newsSourceFinder = new NewsSourceFinder(newsSource);
    this._newsItemMap = new NewsItemMap(lastFetchedNewsItems);
  }

  /**
   * 하나의 검색어가 포함된 가장 최신의 뉴스 항목 하나를 가져옵니다.
   * @param {string} searchKeyword - 검색어
   * @returns {NewsItem} 새로 가져온 뉴스 항목들
   */
  fetchSingleNewsItem(searchKeyword) {
    const fetchUrl = this._createFetchUrl({ searchKeyword, display: 1 });
    const fetchedNewsItems = this._fetchNewsItemsFromAPI(fetchUrl);

    return this._createNewsItem(fetchedNewsItems[0]);
  }

  /**
   * 검색어들이 포함된 최신 뉴스 항목들을 가져옵니다.
   * @param {string[]} searchKeywords - 검색어 목록
   * @returns {NewsItem[]} 새로 가져온 뉴스 항목들
   */
  fetchNewsItems(searchKeywords) {
    searchKeywords.forEach((searchKeyword) => {
      this._fetchNewsItemsForEachKeyword(searchKeyword);
    });

    return this._newsItemMap.newsItems;
  }

  /**
   * 단일 검색어에 대한 뉴스 항목들을 가져옵니다.
   * @param {string} searchKeyword - 검색어
   * @private
   */
  _fetchNewsItemsForEachKeyword(searchKeyword) {
    const fetchUrl = this._createFetchUrl({ searchKeyword });
    const fetchedNewsItems = this._fetchNewsItemsFromAPI(fetchUrl);
    const newsItems = fetchedNewsItems.map((item) => this._createNewsItem(item));

    this._newsItemMap.addNewsItems(newsItems);
  }

  /**
   * API에서 데이터를 가져오고 파싱합니다.
   * @param {string} fetchUrl - API 요청 URL
   * @returns {Object} 파싱된 JSON 응답 데이터
   * @throws {Error} API 요청이 실패하거나 응답 코드가 200이 아닐 경우
   * @private
   */
  _fetchNewsItemsFromAPI(fetchUrl) {
    const fetchedData = UrlFetchApp.fetch(fetchUrl, this._fetchOptions);
    if (fetchedData.getResponseCode() !== 200) {
      throw new Error(fetchedData.getContentText());
    }

    return JSON.parse(fetchedData).items;
  }

  /**
   * 뉴스 항목 객체를 생성합니다.
   * @param {Object} newsItem - API로부터 å받아온 뉴스 항목 데이터
   * @returns {NewsItem} 생성된 NewsItem 객체
   * @private
   */
  _createNewsItem(newsItem) {
    return new NewsItem({
      title: bleachText(newsItem.title),
      link: newsItem.link,
      source: this._newsSourceFinder.getSourceByLink(newsItem.originallink),
      description: bleachText(newsItem.description),
      pubDate: new Date(newsItem.pubDate),
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
    const searchParams = new URLSearchParams({
      query: encodeURIComponent(searchKeyword),
      start: startIndex,
      display,
      sort: "date",
    });

    return `${this._apiUrl}?${searchParams.toString()}`;
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
    const domain = this._extractDomain(originalLink);

    if (!domain) {
      return "(알수없음)";
    }

    const index = this._findSourceIndex(originalLink);

    return index !== -1 ? this._sources[index][1] : domain;
  }

  /**
   * URL에서 도메인을 추출하여 반환합니다.
   * @param {string} url - 도메인을 추출할 URL
   * @returns {string|null} 추출된 도메인 (도메인이 없는 경우 null 반환)
   * @private
   */
  _extractDomain(url) {
    const address = url
      .toLowerCase()
      .replace(
        /^(https?:\/?\/?)?(\/?\/?www\.)?(\/?\/?news\.)?(\/?\/?view\.)?(\/?\/?post\.)?(\/?\/?photo\.)?(\/?\/?photos\.)?(\/?\/?blog\.)?/,
        "",
      );
    const domain = address.match(/^([^:\/\n\?\=]+)/);

    return domain ? domain[0] : null;
  }

  /**
   * 이진 탐색을 사용하여 뉴스 소스의 인덱스를 찾습니다.
   * @param {string} url - 도메인을 탐색할 URL
   * @returns {number} 찾은 뉴스 소스의 인덱스 (찾지 못한 경우 -1 반환)
   * @private
   */
  _findSourceIndex(url) {
    let left = 0;
    let right = this._sources.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const source = this._sources[mid];
      const sourceUrl = source[0];

      if (url.startsWith(sourceUrl)) {
        return this._findSubpathIndex({ url, index: mid });
      }

      if (url < sourceUrl) {
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
   * @param {string} params.url - 검색할 URL
   * @param {number} params.index - 시작 인덱스
   * @returns {number} 최종 뉴스 소스의 인덱스
   * @private
   */
  _findSubpathIndex({ url, index }) {
    let subpathIndex = index;

    while (
      subpathIndex + 1 < this._sources.length &&
      url.startsWith(this._sources[subpathIndex + 1][0])
    ) {
      subpathIndex += 1;
    }

    return subpathIndex;
  }
}

/**
 * 다양한 채널로 메시지와 뉴스 아이템을 전송하는 서비스 클래스입니다.
 */
class MessagingService {
  /**
   * MessagingService 클래스의 생성자입니다.
   * @param {Object} params - 설정 객체
   * @param {Object.<string, string>} params.webhooks - 채널별 웹훅 URL 객체
   * @param {Object} params.newsCardGenerator - 뉴스 카드 생성기 객체
   * @param {Object} params.messageGenerator - 메시지 생성기 객체
   */
  constructor({ webhooks, newsCardGenerator, messageGenerator }) {
    this._webhooks = { ...webhooks };
    this._newsCardGenerator = newsCardGenerator;
    this._messageGenerator = messageGenerator;
    this._defaultParams = {
      method: "post",
      contentType: "application/json",
    };
    this._deliveredNewsItems = [];
  }

  /**
   * 여러 채널로 뉴스를 전송하고, 전송 완료된 뉴스 항목을 저장합니다.
   * @param {NewsItem[]} newsItems - 전송할 뉴스 아이템 배열
   */
  sendNewsItems(newsItems) {
    newsItems.forEach((newsItem) => {
      this._sendNewsItemToChannels(newsItem);
      this._deliveredNewsItems.push(newsItem);
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
    if (fetchResponse.getResponseCode() !== 200) {
      throw new Error(fetchResponse.getContentText());
    }
  }

  /**
   * 전송 완료된 뉴스 기사들에 대한 정보를 반환합니다.
   * @returns {NewsItem[]} 전송 완료된 뉴스 기사들
   */
  get deliveredNewsItems() {
    return [...this._deliveredNewsItems];
  }
}

/**
 * 뉴스 아이템을 구글 시트에 저장하는 서비스 클래스입니다.
 */
class ArchivingService {
  /**
   * ArchivingService 클래스의 생성자입니다.
   * @param {Object} params - 생성자 매개변수
   * @param {Object} params.config - 구글 시트 설정 정보
   * @param {string} params.config.ID - 스프레드시트 ID
   * @param {string} params.config.NAME - 워크시트 이름
   */
  constructor({ config }) {
    this._config = { ...config };
    this._spreadSheet = this._getSpreadSheet(this._config.ID);
    this._workSheet = this._getOrCreateWorkSheet(this._config.NAME);
    this._workSheetTargetCell = `${this._config.NAME}!A2`;
  }

  /**
   * 스프레드시트 객체를 가져옵니다.
   * @param {string} spreadSheetId - 스프레드시트 ID
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} 스프레드시트 객체
   * @private
   */
  _getSpreadSheet(spreadSheetId) {
    try {
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
      headerRange.values = [["날짜/시각", "제목", "매체명", "URL", "내용"]];
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
    newsItems.forEach((newsItem) => {
      this._archiveNewsItem(newsItem.data);
    });
  }

  /**
   * 뉴스 아이템을 구글 시트에 저장합니다.
   * @param {Object} newsItem - 저장할 뉴스 아이템 데이터
   * @param {string} newsItem.title - 뉴스 제목
   * @param {string} newsItem.link - 뉴스 링크
   * @param {string} newsItem.source - 뉴스 출처
   * @param {string} newsItem.description - 뉴스 설명
   * @param {string} newsItem.pubDateText - 발행일 텍스트
   * @param {string[]} newsItem.keywords - 키워드 배열
   */
  _archiveNewsItem({ pubDateText, title, source, link, description, keywords }) {
    try {
      this._workSheet.insertRowBefore(2);
      const valueRange = Sheets.newValueRange();
      valueRange.values = [[pubDateText, title, source, link, description, keywords.join(", ")]];

      Sheets.Spreadsheets.Values.update(
        valueRange,
        this._spreadSheet.getId(),
        this._workSheetTargetCell,
        {
          valueInputOption: "USER_ENTERED",
        },
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
