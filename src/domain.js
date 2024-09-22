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

    const compareFunction = sortByDesc
      ? (a, b) => b.pubDate - a.pubDate
      : (a, b) => a.pubDate - b.pubDate;

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
