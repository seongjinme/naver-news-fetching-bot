/**
 * 설정값 유효성 검사 중 발생하는 오류를 나타내는 사용자 정의 에러 클래스입니다.
 * @extends Error
 */
export class ConfigValidationError extends Error {
  /**
   * ConfigValidationError 생성자
   * @param {string} message - 오류 메시지
   */
  constructor(message) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

/**
 * GAS 환경에 설정된 Property를 다룰 때 발생하는 오류를 나타내는 사용자 정의 에러 클래스입니다.
 * @extends Error
 */
export class PropertyError extends Error {
  /**
   * PropertyError 생성자
   * @param {string} message - 오류 메시지
   */
  constructor(message) {
    super(message);
    this.name = "PropertyError";
  }
}

/**
 * 뉴스 수신 중 발생한 오류에 대한 사용자 정의 에러 클래스입니다.
 * @extends Error
 */
export class NewsFetchError extends Error {
  /**
   * NewsFetchError 생성자
   * @param {string} message - 오류 메시지
   */
  constructor(message) {
    super(message);
    this.name = "NewsFetchError";
  }
}

/**
 * 뉴스봇 초기화 구동 중 발생한 오류에 대한 사용자 정의 에러 클래스입니다.
 * @extends Error
 */
export class InitializationError extends Error {
  /**
   * InitializationError 생성자
   * @param {string} message - 오류 메시지
   */
  constructor(message) {
    super(message);
    this.name = "InitializationError";
  }
}
