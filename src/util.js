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
      Logger.log(
        `[ERROR] '${property}' 속성값을 불러오지 못했습니다.\n에러 원문 메시지 : ${error.message}`,
      );
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
      Logger.log(
        `[ERROR] '${property}' 속성값을 저장하지 못했습니다.\n에러 원문 메시지 : ${error.message}`,
      );
    }
  },
};

/**
 * 주어진 텍스트에 포함된 Entity들 가운데 HTML Tag 요소들을 제거하고 원래 의도된 특수문자로 대체한 뒤 반환합니다.
 * @param {string} text - 기사 제목/요약문 텍스트
 * @returns {string} 일부 특수문자가 처리된 기사 제목/요약문 텍스트
 */
function getBleachedText(text) {
  text = text.replace(/(<([^>]+)>)/gi, "");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#039;/gi, "'");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/`/gi, "'");
  text = text.replace(/&apos;/gi, "'");

  return text;
}

/**
 * UPPER_CASE로 작성된 텍스트를 camelCase로 수정합니다.
 * @param {string} text - UPPER_CASE 텍스트
 * @returns {string} camelCase 형식으로 수정된 텍스트
 */
function toCamelCase(text) {
  return text.toLowerCase().replace(/_(.)/g, (_, c) => c.toUpperCase());
}
