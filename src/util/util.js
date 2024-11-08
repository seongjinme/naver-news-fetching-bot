import { PropertyError, ConfigValidationError } from "./error";

/**
 * GAS의 PropertiesService를 사용하여 속성값을 관리하는 유틸리티 객체입니다.
 * @typedef {Object} PropertyManager
 * @property {function(string): string|null} getProperty - 지정된 하나의 속성값을 가져오는 함수
 * @property {function(string, string): void} setProperty - 지정된 속성값을 설정하고 저장하는 함수
 */
export const PropertyManager = {
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
export function getBleachedText(text) {
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
export function toCamelCase(text) {
  return text.toLowerCase().replace(/_(.)/g, (_, c) => c.toUpperCase());
}

/**
 * string[] 타입의 두 배열이 순서 구분 없이 서로 동일한 크기와 내용을 가졌는지 검증합니다.
 * @param {string[]} arrayA - A 배열
 * @param {string[]} arrayB - B 배열
 * @returns {boolean} 두 배열의 비교 결과값
 */
export function isTwoArraysEqual(arrayA, arrayB) {
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
export function objectToQueryParams(params) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

/**
 * 주어진 URL에서 Google SpreadSheet ID값을 추출하여 반환합니다.
 * @param {string} sheetUrl - Google SpreadSheet 공유용 URL string 전체
 * @returns {string|null} 추출된 ID값 (없을 경우 null)
 */
export function getSpreadSheetId(sheetUrl) {
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
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 뉴스봇 구동 설정값을 검증합니다.
 * @param {Object} config - 뉴스봇 구동 설정값 객체
 * @throws {ConfigValidationError} 설정값 검증 실패시 에러 반환
 */
export function validateConfig(config) {
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
  if (config.ARCHIVING.IS_ENABLED && typeof Sheets === "undefined") {
    throw new ConfigValidationError(
      "구글 시트로 뉴스를 저장하시려면, 스크립트 실행 환경 좌측의 서비스(Services)에서 Google Sheets API를 'Sheets'라는 이름으로 불러오도록 설정되어 있어야 합니다.",
    );
  }

  if (Object.values(config.WEBHOOK).every(({ IS_ENABLED, _ }) => !IS_ENABLED) && !config.ARCHIVING.IS_ENABLED) {
    throw new ConfigValidationError(
      "뉴스 항목을 전송할 웹훅 사용 여부(CONFIG.WEBHOOK.*.IS_ENABLED)와 뉴스 항목 저장 여부(CONFIG.ARCHIVING.IS_ENABLED) 가운데 최소 1가지 이상은 true여야 합니다.",
    );
  }
}
