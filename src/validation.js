const Validation = {
  /**
   * 뉴스봇 구동 설정값을 검증합니다.
   * @param {Object} config - 뉴스봇 구동 설정값 객체
   * @throws {Error} 설정값 검증 실패시 에러 반환
   */
  validateConfig: (config) => {
    if (typeof config !== "object" || config === null) {
      throw new Error("설정값 객체(CONFIG)가 존재하지 않습니다.");
    }

    if (typeof config.DEBUG !== "boolean") {
      throw new Error("디버그 모드(DEBUG) 설정값은 true 혹은 false여야 합니다.");
    }

    if (!Array.isArray(config.KEYWORDS) || config.KEYWORDS.length === 0) {
      throw new Error("검색어 목록(KEYWORDS)에는 최소 하나 이상의 검색어를 포함해야 합니다.");
    }
    config.KEYWORDS.forEach((keyword, index) => {
      if (typeof keyword !== "string" || keyword.trim() === "") {
        throw new Error(
          `검색어 목록(KEYWORDS)의 ${index + 1}번째 검색어는 반드시 글자가 포함된 문자여야 합니다.`,
        );
      }
    });

    if (typeof config.NAVER_API_CLIENT !== "object" || config.NAVER_API_CLIENT === null) {
      throw new Error(
        "네이버 검색 오픈 API 설정값(NAVER_API_CLIENT)은 반드시 객체 형태로 작성되어야 합니다.",
      );
    }
    if (
      typeof config.NAVER_API_CLIENT.ID !== "string" ||
      config.NAVER_API_CLIENT.ID.trim() === ""
    ) {
      throw new Error("네이버 검색 오픈 API의 Client ID(NAVER_API_CLIENT.ID)값이 비어 있습니다.");
    }
    if (
      typeof config.NAVER_API_CLIENT.SECRET !== "string" ||
      config.NAVER_API_CLIENT.SECRET.trim() === ""
    ) {
      throw new Error("네이버 검색 오픈 API의 Secret(NAVER_API_CLIENT.SECRET)값이 비어 있습니다.");
    }

    if (typeof config.WEBHOOK !== "object" || config.WEBHOOK === null) {
      throw new Error("웹훅 주소 설정값(WEBHOOK)은 반드시 객체 형태로 작성되어야 합니다.");
    }
    Object.keys(config.WEBHOOK).forEach((service) => {
      if (typeof config.WEBHOOK[service] !== "object" || config.WEBHOOK[service] === null) {
        throw new Error(
          `웹훅 주소 설정값(WEBHOOK) 안의 "${service}" 설정값은 객체 형태여야 합니다.`,
        );
      }
      if (typeof config.WEBHOOK[service].IS_ENABLED !== "boolean") {
        throw new Error(
          `웹훅 주소 설정값(WEBHOOK) 안의 ${service}.IS_ENABLED 값은 true 혹은 false여야 합니다.`,
        );
      }
      if (typeof config.WEBHOOK[service].URL !== "string") {
        throw new Error(
          `웹훅 주소 설정값(WEBHOOK) 안의 ${service}.URL 값은 웹훅의 url 주소가 담겨있거나 비어있는("") 문자열 형태여야 합니다.`,
        );
      }
    });

    if (typeof config.ARCHIVING !== "object" || config.ARCHIVING === null) {
      throw new Error("뉴스 저장 설정값(ARCHIVING)은 반드시 객체 형태로 작성되어야 합니다.");
    }
    if (typeof config.ARCHIVING.IS_ENABLED !== "boolean") {
      throw new Error("뉴스 저장 여부 설정값(ARCHIVING.IS_ENABLED)은 true 혹은 false여야 합니다.");
    }
    if (typeof config.ARCHIVING.SHEET_INFO !== "object" || config.ARCHIVING.SHEET_INFO === null) {
      throw new Error(
        "뉴스를 저장할 구글 시트 정보(ARCHIVING.SHEET_INFO)의 설정값은 객체 형태여야 합니다.",
      );
    }
    Object.keys(config.ARCHIVING.SHEET_INFO).forEach((field) => {
      if (typeof config.ARCHIVING.SHEET_INFO[field] !== "string") {
        throw new Error(
          `뉴스 저장용 구글 시트 정보(ARCHIVING.SHEET_INFO)에 포함된 ${field} 설정값은 해당 정보가 담겨있거나 비어있는("") 문자열 형태여야 합니다.`,
        );
      }
    });
  },
};
