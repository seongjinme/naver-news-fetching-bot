/*************************************************************************************************
 * Naver News Fetching Bot (v2.2.0)
 * ***********************************************************************************************
 * 원하는 검색어가 포함된 최신 네이버 뉴스를 업무용 채팅 솔루션으로 전송합니다.
 * 슬랙(Slack), 팀즈(Microsoft Teams), 잔디(JANDI), 구글챗(Google Chat Space)을 지원합니다.
 * Google Apps Script와 네이버 검색 오픈 API를 이용합니다.
 *
 * - Github : https://github.com/seongjinme/naver-news-fetching-bot
 * - 문의사항 : mail@seongjin.me
 * ***********************************************************************************************/

function globalVariables() {

  /***********************************************************************************************
   * 뉴스봇 구동에 필요한 설정값들입니다. 아래 설명을 참고하시어 입력해주세요.
   * *********************************************************************************************
   * - "allow" 접두어가 붙은 옵션 중 최소 하나 이상은 true로 설정되어야 합니다.
   * - true/false로만 입력하는 경우가 아니면, 설정값 앞뒤로 쌍따옴표("")가 반드시 필요합니다.
   * - 마지막 항목 외에는 모든 설정값 끝에 쉼표(,)가 반드시 필요합니다.
   * *********************************************************************************************
   * DEBUG           : 디버그 모드 ON/OFF (true/false로만 입력, 기본값: false)
   *
   * clientId        : 네이버 검색 오픈 API 접근 가능한 Client ID 값
   * clientSecret    : 네이버 검색 오픈 API 접근 가능한 Client Secret 값
   *
   * keyword         : 모니터링할 네이버 뉴스 검색어
   *
   * allowBotSlack   : 뉴스 항목의 Slack 전송 여부 (true/false로만 입력)
   * webhookSlack    : Slack Workspace 공간에 설정된 웹훅(Webhook URL)
   *
   * allowBotTeams   : 뉴스 항목의 Slack 전송 여부 (true/false로만 입력)
   * webhookTeams    : Slack Workspace 공간에 설정된 웹훅(Webhook URL)
   *
   * allowBotJandi   : 뉴스 항목의 Slack 전송 여부 (true/false로만 입력)
   * webhookJandi    : Slack Workspace 공간에 설정된 웹훅(Webhook URL)
   *
   * allowBotGoogle  : 뉴스 항목의 Google Chat Space 전송 여부 (true/false로만 입력)
   * webhookGoogle   : Google Chat Space 공간에 설정된 웹훅(Webhook) URL
   *
   * allowArchiving  : 뉴스 항목의 구글 시트 저장 여부 (true/false로만 입력, 기본값: true)
   * spreadsheetId   : 뉴스 항목을 저장할 구글 시트 문서 ID값
   * sheetName       : 뉴스 항목을 저장할 구글 시트 문서의 해당 시트 이름
   * sheetTargetCell : 뉴스 항목을 저장할 구글 시트 셀 영역의 좌상단 첫 번째 셀 경로 (제목행 다음줄의 첫 번째 셀)
   * *********************************************************************************************/

  return values = {

    // 디버그 모드 설정
    DEBUG            : false,

    // 네이버 검색 오픈 API Client ID 및 Secret 값
    clientId         : "[네이버 오픈 API용 Client ID]",
    clientSecret     : "[네이버 오픈 API용 Client Secret]",

    // 네이버 뉴스 검색어
    keyword          : "[검색키워드]",

    // Slack 전송 설정
    allowBotSlack    : false,
    webhookSlack     : "[URL]",

    // Microsoft Teams 전송 설정
    allowBotTeams    : false,
    webhookTeams     : "[URL]",

    // JANDI 전송 설정
    allowBotJandi    : false,
    webhookJandi     : "[URL]",

    // Google Chat Space 전송 설정
    allowBotGoogle   : false,
    webhookGoogle    : "[URL]",

    // Google Spreadsheet 아카이빙 설정
    allowArchiving   : false,
    spreadsheetId    : "[SPREADSHEET_ID]",
    sheetName        : "[SPREADSHEET_SHEET_NAME]",
    sheetTargetCell  : "[SPREADSHEET_SHEET_NAME]!A2"

  };
}

/***************************************************************************
 * 여기서부터는 꼭 필요한 경우가 아니라면 수정하지 말아주세요.
 * *************************************************************************/

function getFeedUrl(keyword) {

  // 뉴스 검색 결과 출력 건수 지정 (미지정시 기본값 10, 최대 100; 권장값 10~50)
  const display = "50";

  // 뉴스 검색 시작 위치 지정 (미지정시 기본값 1, 최대 1000; 권장값 1)
  const start = "1";

  // 뉴스 검색결과 정렬 옵션 (미지정시 기본값 date(날짜순), 이외에 sim(유사도순) 지정 가능하나 비추천)
  const sort = "date";

  return "https://openapi.naver.com/v1/search/news.xml?query=" + keyword + "&display=" + display + "&start=" + start + "&sort=" + sort;

}


function getFeed(keyword, clientId, clientSecret) {

  const feedUrl = getFeedUrl(keyword);
  const options = {
    "method": "get",
    "headers": {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret
    }
  };

  return UrlFetchApp.fetch(feedUrl, options);

}


function getSource(originallink) {

  // source.gs에 저장된 언론사별 URL 리스트를 가져온다.
  const list = listSource();

  // 넘겨받은 뉴스 원문 주소에서 불필요한 부분을 제거한다.
  const address = originallink.toLowerCase().replace(/^(https?:\/?\/?)?(\/?\/?www\.)?(\/?\/?news\.)?(\/?\/?view\.)?/, "");

  // 원문 주소에 맞는 매체명을 탐색하여 리턴한다. 탐색 결과가 없을 경우 "(알수없음)"을 리턴한다.
  const index = searchSourceIndex(address, list);
  if (index >= 0 && index <= list.length - 1) {
    return list[index][1];
  }
  else {
    return "(알수없음)";
  }

}


function searchSourceIndex(address, list) {

  let left = 0;
  let right = list.length - 1;

  while (left <= right) {

    let index = Math.floor((left + right) / 2);
    let address_stripped = address.substr(0, list[index][0].length);

    if (address_stripped === list[index][0]) {
      return checkSourceIndex(index, list, address, address_stripped);
    }
    else if (address_stripped < list[index][0]) {
      right = index - 1;
    }
    else {
      left = index + 1;
    }

  }

  return -1;

}


function checkSourceIndex(index, list, address, address_stripped) {

  let i = index;

  // addressSearch()에서 확인된 매체명 경로를 포함하는 하위 경로가 추가로 존재하는지 체크한다.
  while (true) {
    if (list[i + 1][0].includes(address_stripped)) {
      i++;
    }
    else {
      break;
    }
  }

  // 추가 하위 경로가 없다면 원래의 매체명 index값을 리턴한다.
  if (i === index) {
    return index;
  }

  // 만약 있다면, 해당되는 범위의 우측 끝에 위치한 매체명부터 차례로 체크한 뒤 조건에 맞는 매체명 index값을 리턴한다.
  while (i >= index) {
    if (address.includes(list[i][0])) {
      return i;
    }
    i--;
  }

  return -1;

}


function getArticle(g, feed) {

  // PropertiesService 객체를 통해 저장된 마지막 뉴스 업데이트 시점을 가져온다.
  const lastArticleUpdateTime = new Date(parseFloat(PropertiesService.getScriptProperties().getProperty("lastArticleUpdateTime")));

  Logger.log("* 마지막 뉴스 업데이트 시점 : " + lastArticleUpdateTime);
  Logger.log("* 네이버뉴스 키워드 검색 시작 : '" + g.keyword + "'");

  // 뉴스 검색 결과물을 가져와 item 단위로 시간순 정렬시키고 Fetching 작업을 시작한다.
  const xml = XmlService.parse(feed.getContentText());
  const items = xml.getRootElement().getChild('channel').getChildren('item').reverse();

  let cnt = 0;
  let archiveItems = [];

  for (let i = 0; i < items.length; i++) {

    const pubDate = new Date(items[i].getChildText('pubDate'));

    if (pubDate > lastArticleUpdateTime) {

      // 각 item 별로 데이터 필드들을 가져온다.
      const title = bleachText(items[i].getChildText('title'));
      const link = items[i].getChildText('link');
      const source = getSource(items[i].getChildText('originallink'));
      const description = bleachText(items[i].getChildText('description'));
      const pubDateText = Utilities.formatDate(pubDate, "GMT+9", "yyyy-MM-dd HH:mm:ss");

      // DEBUG 모드일 경우 => 챗봇/아카이빙 기능을 정지하고 처리된 데이터를 로그로만 출력시킨다.
      if (g.DEBUG) {
        Logger.log("----- " + items.length + "개 항목 중 " + (i + 1) + "번째 -----");
        Logger.log(pubDateText + "\n" + title + "\n" + source + "\n" + link + "\n" + description);
      }

      // DEBUG 모드가 아닐 경우 => 챗봇/아카이빙 기능을 실행한다.
      else {
        Logger.log("'" + title + "' 항목 게시 중...");

        if (g.allowBotSlack || g.allowBotTeams || g.allowBotJandi || g.allowBotGoogle) {
          postArticle(g, pubDateText, title, source, description, link);
        }

        if (g.allowArchiving) {
          archiveItems[archiveItems.length] = [pubDateText, title, source, link, description];
        }
      }

      // PropertiesService 객체에 마지막 뉴스 업데이트 시점을 새로 업데이트한다.
      PropertiesService.getScriptProperties().setProperty('lastArticleUpdateTime', pubDate.getTime());
      cnt++;

    }

  }

  Logger.log("* 총 " + parseInt(cnt, 10) + "건의 항목이 게시되었습니다.");

  // DEBUG 모드가 아니며 뉴스 항목의 구글 시트 저장이 설정되었다면, 새로 Fetching된 항목들을 시트에 전송한다.
  if (!g.DEBUG && g.allowArchiving && cnt > 0) {
    archiveArticle(g.spreadsheetId, g.sheetName, g.sheetTargetCell, archiveItems);
  }

}


async function postArticle(g, pubDateText, title, source, description, link) {

  // 채팅 서비스별 초당/분당 request 횟수 제한을 고려하여 sleep 기능을 정의한다.
  // Source : https://stackoverflow.com/a/39914235
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  if (g.allowBotSlack) {
    const article = createArticleCardSlack(pubDateText, title, source, description, link);
    const params = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(article)
    };
    UrlFetchApp.fetch(g.webhookSlack, params);
  }

  if (g.allowBotTeams) {
    const article = createArticleCardTeams(pubDateText, title, source, description, link);
    const params = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(article)
    };
    UrlFetchApp.fetch(g.webhookTeams, params);
  }

  if (g.allowBotJandi) {
    const article = createArticleCardJandi(pubDateText, title, source, description, link);
    const params = {
      "method": "post",
      "contentType": "application/json",
      "header": {
        "Accept": "application/vnd.tosslab.jandi-v2+json"
      },
      "payload": JSON.stringify(article)
    };
    UrlFetchApp.fetch(g.webhookJandi, params);
    // Logger.Log(UrlFetchApp.getRequest())
  }

  if (g.allowBotGoogle) {
    const article = createArticleCardGoogle(pubDateText, title, source, description, link);
    const params = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(article)
    };
    UrlFetchApp.fetch(g.webhookGoogle, params);
  }

  // 채팅 솔루션별 초당/분당 request 횟수 제한을 고려하여 다음 항목 처리 전에 일정 시간 대기시킨다.
  await sleep(200);

}


function archiveArticle(spreadsheetId, sheetName, sheetTargetCell, archiveItems) {

  const ss = SpreadsheetApp.openById(spreadsheetId);

  // sheetName으로 지정된 시트가 없을 경우, header를 포함하여 새로 생성한다.
  if (!ss.getSheetByName(sheetName)) {
    ss.insertSheet(sheetName, 1);

    const headerRange = Sheets.newValueRange();
    headerRange.values = [["날짜/시각", "제목", "매체명", "URL", "내용"]];

    const headerTargetCell = sheetName + "!A1";

    Sheets.Spreadsheets.Values.update(headerRange, spreadsheetId, headerTargetCell, {
      valueInputOption: 'RAW'
    });
  }

  const ws = ss.getSheetByName(sheetName);

  ws.insertRowsBefore(2, archiveItems.length);
  const valueRange = Sheets.newValueRange();
  valueRange.values = archiveItems.reverse();

  Sheets.Spreadsheets.Values.update(valueRange, spreadsheetId, sheetTargetCell, {
    valueInputOption: 'USER_ENTERED'
  });

}


function bleachText(text) {

  // 데이터 필드에 포함된 HTML Tag를 제거하고 Entity들을 원래 의도된 특수문자로 대체한다.
  text = text.replace(/(<([^>]+)>)/gi, '');
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#039;/gi, "'");
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/&amp;/gi, '&');
  text = text.replace(/`/gi, "'");

  return text;

}


function runFetchingBot() {

  // 뉴스봇을 처음 실행하는 경우, PropertiesService 객체를 통해 최초 실행 시각과 뉴스봇 구동 여부를 저장 후 종료시킨다.
  if (!PropertiesService.getScriptProperties().getProperty("lastArticleUpdateTime")) {
    PropertiesService.getScriptProperties().setProperty("lastArticleUpdateTime", Date.now());
    Logger.log("* 초기 설정이 완료되었습니다. 다음 실행때부터 뉴스 항목을 가져옵니다.")
    return;
  }

  // 뉴스봇 구동 설정값들을 불러온다.
  const g = globalVariables();

  // 뉴스봇 및 아카이빙 기능이 모두 false로 설정된 경우 에러 로그와 함께 실행을 종료한다.
  if (!g.allowArchiving && !g.allowBotSlack && !g.allowBotTeams && !g.allowBotJandi && !g.allowBotGoogle) {
    Logger.log("* 뉴스봇 및 아카이빙 기능이 모두 false로 설정되어 있습니다. 설정값들을 다시 확인해주세요.\n");
    return;
  }

  // 네이버 뉴스 피드를 체크한다.
  const feed = getFeed(g.keyword, g.clientId, g.clientSecret);

  // 피드의 응답 코드가 정상(200)이라면 뉴스봇 기능을 구동한다.
  if (feed.getResponseCode() == 200) {
    getArticle(g, feed);
  }

  // 이외의 응답 코드가 리턴될 경우 에러 체크를 위한 헤더 및 내용을 로그로 출력시킨다.
  else {
    Logger.log("* 뉴스를 가져오는 과정에서 에러가 발생했습니다. 로그를 참고해주세요.\n");
    Logger.log(feed.getHeaders());
    Logger.log(feed.getContentText());
    return;
  }

}
