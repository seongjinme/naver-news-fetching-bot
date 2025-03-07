# Changelog

## Ver 3.0.2 (2025-03-07)

### Fixed

- Google Chat에서 알림 메시지 형식이 아닌 뉴스 항목만 전송되지 않던 문제 수정
  - Google Chat의 Cards v1 인터페이스 지원이 중단되어, 기존 뉴스 카드 템플릿을 [v2 인터페이스](https://developers.google.com/workspace/chat/api/reference/rest/v1/cards) 기반으로 업데이트

## Ver 3.0.1 (2024-12-05)

### Fixed

- 최초 설치 시 설정된 키워드로 `최근 1시간 이내에 게재된 뉴스`가 없을 경우 샘플 뉴스가 전송되지 않던 문제 수정
  - 앞으로는 단 1건이라도 해당 키워드로 게재된 뉴스가 있었다면 그 뉴스를 샘플로 전송합니다.
  - 만약 1건도 게재된 적 없었다면 샘플 뉴스 전송을 생략하고 다음 설치 단계로 넘어갑니다.

### Changed

- 최초 설치를 위한 가이드 문서(`INSTALLATION.md`)의 일부 표현 및 참고 이미지 개선

## Ver 3.0.0 (2024-11-08)

코드 베이스부터 완전히 새롭게 리뉴얼한 버전입니다.
이전 버전과는 호환되지 않으므로, 기존 프로젝트를 삭제하고 새 프로젝트에 재설치하여 사용해 주세요.

### Added

- **다중 키워드 검색 지원 (최대 5개)**
  - 뉴스 항목에 검색 키워드 정보가 포함됩니다.
  - 다중 키워드 매칭 시 쉼표로 구분하여 표시됩니다. (예: "키워드1, 키워드2")
- **Discord 지원 추가**
- **자동 트리거 설정 기능**
  - 최초 설치 시 매분 실행되는 트리거가 자동으로 생성됩니다.
  - 수동으로 "내 트리거(My Triggers)" 탭에서 실행 설정을 추가할 필요가 없습니다.

### Changed

- **파일 구성 최적화**
  - `dist/` 디렉토리의 3개 파일만으로 설치가 가능합니다.
    - `Code.gs`: 핵심 로직
    - `config.gs`: 설정 파일 (사용자 설정 필요)
    - `source.gs`: 매체 데이터
- `source.gs` 데이터베이스 업데이트 (2024년 11월 기준 736개 → 853개 매체로 확장)

### Fixed

- 동일 시각 게시된 뉴스 중 일부가 누락되는 문제 해결 ([#5](https://github.com/seongjinme/naver-news-fetching-bot/issues/5))

### Removed

- **Microsoft Teams 지원 종료**
  - Microsoft의 [Incoming Webhook 커넥터 2025년 지원 종료 공지](https://devblogs.microsoft.com/microsoft365dev/retirement-of-office-365-connectors-within-microsoft-teams/)에 따른 조치
  - 대체 솔루션 마련 시까지 Teams 지원 잠정 중단

---

## Ver 2.2.3 (2023-05-15)

### Fixed

- 검색어 키워드 URL 인코딩 오류 수정 ([#4](https://github.com/seongjinme/naver-news-fetching-bot/pull/4)) - by [Lucas_Ghae](https://github.com/JungHoonGhae)

## Ver 2.2.2 (2022-08-24)

### Changed

- **초기 실행 및 키워드 변경 시 알림 개선**
  - 최초 실행 시 설치 완료 메시지와 함께 최신 뉴스 1건 샘플 전송
  - 검색 키워드 변경 시 변경 완료 알림 메시지 전송
- 미등록 매체의 표기 방식 변경: `(알수없음)` → 도메인 주소 표시

### Added

- `template.gs`: 채팅 솔루션별 메시지 템플릿 추가
- 초기 설정값 유효성 검증 로직 구현 (네이버 API 인증정보, 검색 키워드)

## Ver 2.2.1 (2022-05-03)

### Fixed

- `source.gs`: 마지막 매체 항목 탐색 오류 수정

## Ver 2.2.0 (2022-05-02)

### Added

- **마이크로소프트 팀즈(Microsoft Teams), 잔디(Jandi) 지원 추가**

### Changed

- `source.gs` 데이터베이스 업데이트 (2022년 5월 기준 736개 매체)
- 매체명 탐색 알고리즘 성능 개선
- 메신저 플랫폼별 템플릿을 `template.gs`로 분리

### Fixed

- 특정 서브도메인(`news`, `view`)이 포함된 URL의 매체명 식별 오류 수정
- 불필요한 객체 정보 제거를 통한 최적화

## Ver 2.1.0 (2022-03-25)

### Added

- **Slack 플랫폼 지원**
- **매체명 식별 기능 개선**
  - `source.gs`: 매체명 데이터베이스 재구현
  - 2022년 3월 기준 5만여 건의 최신 뉴스 데이터 기반
  - 미등록 매체는 `(알수없음)`으로 표시 (수동 추가 가능)

### Removed

- Google Chat 메시지 포맷 설정 기능

## Ver 2.0.0 (2022-03-20)

### Changed

- **네이버 오픈 API 기반으로 전환** (RSS Feed 지원 중단 대응)
  - 네이버 오픈 API 인증정보 설정 필요 (Client ID, Secret)
  - [인증정보 획득 방법 안내](https://developers.naver.com/docs/common/openapiguide/appregister.md)
- API 응답 코드 검증 로직 추가 (200 코드만 처리)
- HTML 태그 및 엔티티 필터링 개선

### Removed

- API 제한으로 인한 일부 데이터 필드 제거 (매체명, 카테고리, 썸네일)

---

## Ver 1.0.0 (2021-10-18)

### Added

- RSS Feed 기반 초기 버전 출시
- Google Chat 플랫폼 지원
