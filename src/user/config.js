// prettier-ignore
export const CONFIG = {

  /***********************************************************************************************
   * 뉴스봇 구동에 필요한 설정값들입니다. 아래 설명을 참고하시어 입력해주세요.
   * *********************************************************************************************
   * - 디버그 모드(DEBUG)와 SEARCH_LENGTH를 제외한 모든 설정값에는 앞뒤로 쌍따옴표("")가 반드시 필요합니다.
   * - 모든 설정값 끝에는 쉼표(,)가 반드시 필요합니다.
   * *********************************************************************************************
   * DEBUG            : [필수] 디버그 모드 ON/OFF를 설정합니다. (쌍따옴표 없이 true/false로만 입력)
   *
   * KEYWORDS         : [필수] 모니터링할 네이버 뉴스 검색어를 문자열 배열 형태로 설정합니다. (최대 5개까지 가능)
   *                    - 하나의 검색어만 사용하실 경우    -> ["검색어"]
   *                    - 여러 개의 검색어를 원하실 경우   -> ["검색어1", "검색어2", ...]
   *
   * NAVER_API_CLIENT : [필수] 네이버 오픈 API를 사용하기 위한 Client 정보를 입력합니다.
   * - ID             : 네이버 오픈 API의 Client ID 값
   * - SECRET         : 네이버 오픈 API의 Client Secret 값
   *
   * WEBHOOK_URL      : [선택] 뉴스 항목을 전송할 채팅 서비스별 웹훅 주소를 입력합니다.
   *                    사용하실 서비스일 경우 IS_ENABLED 값을 true로, 그렇지 않은 경우 false로 입력해 주세요.
   *                    IS_ENABLED가 true여도 url의 값이 빈 값("")으로 설정된 경우
   *                    해당 채널로는 뉴스가 전송되지 않습니다.
   *                    모든 서비스의 IS_ENABLED가 false로 설정되거나,
   *                    모든 서비스의 url이 빈 값("")으로 설정된다면 채팅 서비스로의 뉴스 전송 기능은 동작하지 않습니다.
   * - [서비스명]       : 해당 서비스명의 대문자 표기이며, 내부에 IS_ENABLED와 URL 설정값을 가집니다.
   *   - IS_ENABLED   : 해당 서비스로의 뉴스 전송 여부 (쌍따옴표 없이 true/false로만 입력)
   *   - URL          : 해당 서비스에 설정된 웹훅 URL 주소
   *
   * ARCHIVING_SHEET  : [선택] 뉴스 항목을 구글 시트(Google Sheet)에 저장하기 위한 설정값입니다.
   *                    사용하실 경우 IS_ENABLED의 값을 true로, 그렇지 않은 경우 false로 입력해 주세요.
   *                    IS_ENABLED의 값을 true로 설정하시더라도
   *                    SHEET_INFO 안의 ID, NAME, TARGET_CELL이 모두 설정되어야만 동작합니다.
   *                    이들 중 하나라도 빈 칸("")으로 설정된 경우, 뉴스 항목 저장 기능은 동작하지 않습니다.
   * - IS_ENABLED     : 뉴스 항목의 구글 시트 저장 여부 (쌍따옴표 없이 true/false로만 입력)
   * - SHEET_INFO     : 뉴스 항목을 저장할 구글 시트에 대한 설정값 모음
   *   - ID           : 구글 시트 문서 ID값
   *   - NAME         : 구글 시트 문서의 해당 시트 이름
   *   - TARGET_CELL  : 구글 시트 셀 영역의 좌상단 첫 번째 셀 경로 (제목행 다음줄의 첫 번째 셀)
   * *********************************************************************************************/

  // 디버그 모드 ON/OFF (쌍따옴표 없이 true/false로만 입력, 기본값: false)
  DEBUG               : false,

  // 모니터링할 네이버 뉴스 검색어 목록
  KEYWORDS            : ["검색어1", "검색어2"],

  // 네이버 검색 오픈 API의 Client ID와 Secret 값
  NAVER_API_CLIENT    : {
    ID                : "",
    SECRET            : "",
  },

  // 뉴스 항목을 전송할 채팅 서비스별 웹훅 주소
  WEBHOOK             : {
    SLACK             : {
      IS_ENABLED      : false,
      URL             : "",
    },
    JANDI             : {
      IS_ENABLED      : false,
      URL             : "",
    },
    GOOGLE_CHAT       : {
      IS_ENABLED      : false,
      URL             : "",
    },
    DISCORD           : {
      IS_ENABLED      : false,
      URL             : "",
    },
  },

  // 뉴스 항목을 저장할 구글 시트(Google Sheet) 문서 경로
  ARCHIVING           : {
    IS_ENABLED        : false,
    SHEET_INFO        : {
      ID                : "",
      NAME              : "",
      TARGET_CELL       : "",
    },
  },
};

export default CONFIG;
