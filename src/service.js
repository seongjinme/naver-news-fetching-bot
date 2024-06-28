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
    const domain = this.extractDomain(originalLink);

    if (!domain) {
      return "(알수없음)";
    }

    const index = this.findSourceIndex(originalLink);

    return index !== -1 ? this._sources[index][1] : domain;
  }

  /**
   * URL에서 도메인을 추출하여 반환합니다.
   * @param {string} url - 도메인을 추출할 URL
   * @returns {string|null} 추출된 도메인 (도메인이 없는 경우 null 반환)
   */
  extractDomain(url) {
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
   */
  findSourceIndex(url) {
    let left = 0;
    let right = this._sources.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const source = this._sources[mid];
      const sourceUrl = source[0];

      if (url.startsWith(sourceUrl)) {
        return this.findSubpathIndex({ url, index: mid });
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
   */
  findSubpathIndex({ url, index }) {
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
