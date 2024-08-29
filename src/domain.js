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
   * @param {Date} newsData.pubDate - 기사 발행일
   * @param {string} newsData.keyword - 기사 검색어
   */
  constructor({ title, link, source, description, pubDate, keyword }) {
    this._title = title;
    this._link = link;
    this._source = source;
    this._description = description;
    this._pubDate = pubDate;
    this._keywords = [].push(keyword);
    this._hashId = this._createHashId();
  }

  /**
   * 뉴스 기사의 고유한 해시 ID값을 생성합니다.
   * @returns {string} 생성된 해시 ID값
   */
  _createHashId() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const hash = Array.from({ length: this._link.length }).reduce((acc, _, index) => {
      return ((acc << 5) - acc + this._link.charCodeAt(index)) | 0;
    }, 0);

    const hashId = Array.from({ length: 20 }).reduce(
      (acc, _) => {
        const index = Math.abs(hash % characters.length);
        const character = characters[index];

        return {
          hashId: acc.hashId + character,
          hash: Math.floor(hash / characters.length),
        };
      },
      { hashId: "", hash },
    ).hashId;

    return hashId;
  }

  /**
   * 뉴스 기사의 발행일이 지정된 시간 이후인지 확인합니다.
   * @param {Object} options - 비교 옵션
   * @param {number} options.lastUpdateTime - 마지막 업데이트 시각(milliseconds)
   * @param {number} [options.subsetTime] - 부분 집합 시간 (선택적)
   * @returns {boolean} 뉴스 기사의 발행일이 지정된 시간 이후인 경우 true, 그렇지 않은 경우 false
   */
  isAfterLastUpdate({ lastUpdateTime, subsetTime }) {
    const subsetTimeAmount = subsetTime && !Number.isNaN(subsetTime) ? subsetTime : 0;
    return this._pubDate.getTime() >= new Date(lastUpdateTime).getTime() - subsetTimeAmount;
  }

  /**
   * 뉴스 기사에 대한 검색 키워드를 추가합니다.
   * @param {Array<string>} keywords - 추가할 검색 키워드 항목
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
   * @returns {Array<string>} 뉴스 기사의 검색 키워드 목록
   */
  get keywords() {
    return [...this._keywords];
  }

  /**
   * 뉴스 기사의 데이터를 반환합니다.
   * @type {Object}
   * @property {string} title - 기사 제목
   * @property {string} link - 기사 링크
   * @property {string} source - 기사 출처
   * @property {string} description - 기사 설명
   * @property {string} pubDateText - 기사 발행일 문자열
   * @property {Array<string>} keywords - 기사 검색어 목록
   */
  get data() {
    return {
      title: this._title,
      link: this._link,
      source: this._source,
      description: this._description,
      pubDateText: Utilities.formatDate(this._pubDate, "GMT+9", "yyyy-MM-dd HH:mm:ss"),
      keywords: [...this._keywords],
    };
  }
}

/**
 * NewsItem 항목들을 관리하는 맵 클래스입니다.
 */
class NewsItemMap {
  /**
   * NewsItemMap 클래스의 생성자입니다.
   * @param {Array<string>} lastFetchedNewsItems - 이전에 가져온 뉴스 항목들의 해시 ID 배열
   */
  constructor(lastFetchedNewsItems) {
    this._newsItemsMap = new Map();
    this._lastFetchedNewsItems = lastFetchedNewsItems;
  }

  /**
   * 뉴스 항목을 맵에 추가합니다. 이미 존재하는 항목의 경우 검색 키워드만 업데이트합니다.
   * @param {NewsItem} newsItem - 추가할 뉴스 항목
   */
  _addNewsItem(newsItem) {
    if (this._lastFetchedNewsItems.includes(newsItem.hashId)) return;

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
    newsItems.forEach((newsItem) => this._addNewsItem(newsItem));
  }

  /**
   * 맵에 저장된 모든 뉴스 항목을 배열로 반환합니다.
   * @returns {NewsItem[]} 모든 뉴스 항목 배열
   */
  get newsItems() {
    return Array.from(this._newsItemsMap.values());
  }

  /**
   * 맵에 저장된 모든 뉴스 항목의 해시 ID를 배열로 반환합니다.
   * @returns {string[]} 모든 뉴스 항목의 해시 ID 배열
   */
  get newsItemsHashIds() {
    return Array.from(this._newsItemsMap.keys());
  }

  /**
   * 맵에 저장된 뉴스 항목의 개수를 반환합니다.
   * @returns {number} 저장된 뉴스 항목의 개수
   */
  get size() {
    return this._newsItemsMap.size;
  }

  /**
   * 맵에 저장된 모든 뉴스 항목을 제거합니다.
   */
  clear() {
    this._newsItemsMap.clear();
  }
}
