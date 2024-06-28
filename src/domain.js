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
    this._hashId = this.createHashId();
  }

  /**
   * 뉴스 기사의 고유한 해시 ID값을 생성합니다.
   * @returns {string} 생성된 해시 ID값
   */
  createHashId() {
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
   * @param {string} keyword - 추가할 검색 키워드 항목
   */
  addSearchKeyword(keyword) {
    this._keywords.push(keyword);
  }

  /**
   * 뉴스 기사의 고유한 해시 ID값을 반환합니다.
   * @returns {string} 뉴스 기사의 해시 ID값
   */
  get hashId() {
    return this._hashId;
  }

  /**
   * 뉴스 기사의 데이터를 불변 객체로 반환합니다.
   * @type {Object}
   * @property {string} title - 기사 제목
   * @property {string} link - 기사 링크
   * @property {string} source - 기사 출처
   * @property {string} description - 기사 설명
   * @property {Date} pubDate - 기사 발행일
   * @property {Array<string>} keywords - 기사 검색어 목록
   * @readonly
   */
  get data() {
    return Object.freeze({
      title: this._title,
      link: this._link,
      source: this._source,
      description: this._description,
      pubDate: this._pubDate,
      keywords: this._keywords,
    });
  }
}
