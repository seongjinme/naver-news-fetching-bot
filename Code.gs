/*****************************************************************************
 * Naver News Fetching Bot (v2.0)
 * ***************************************************************************
 * 특정 검색어의 네이버 뉴스피드를 구글챗 스페이스(Google Chat Space)로 중계합니다.
 * Google Apps Script와 네이버 검색 오픈 API를 이용합니다.
 * 
 * - Github : https://github.com/seongjinme/naver-news-fetching-bot
 * - 문의사항 : mail@seongjin.me
 * ***************************************************************************/

function globalVariables() { 

  /***************************************************************************
   * 뉴스봇 구동에 필요한 설정값들입니다. 아래 설명을 참고하시어 입력해주세요.
   * *************************************************************************
   * - true/false로만 입력하는 경우 외엔 설정값 앞뒤로 쌍따옴표("")가 반드시 필요합니다.
   * - 마지막 항목 외에는 모든 설정값 끝에 쉼표(,)가 반드시 필요합니다.
   * *************************************************************************
   * DEBUG           : 디버그 모드 ON/OFF (true/false로만 입력, 기본값: false)
   * 
   * clientId        : 네이버 검색 오픈 API 접근 가능한 Client ID 값
   * clientSecret    : 네이버 검색 오픈 API 접근 가능한 Client Secret 값
   * 
   * keyword         : 모니터링할 네이버뉴스 검색어
   * webhook         : Google Chat Space 공간에 설정된 웹훅(Webhook) URL
   * card            : 뉴스 항목의 카드 포맷 전송 여부 (true/false로만 입력, 기본값: true)
   * allowArchiving  : 뉴스 항목의 구글 시트 저장 여부 (true/false로만 입력, 기본값: true)
   * spreadsheetId   : 뉴스 항목을 저장할 구글 시트 문서 ID값
   * sheetName       : 뉴스 항목을 저장할 구글 시트 문서의 해당 시트 이름
   * sheetTargetCell : 뉴스 항목을 저장할 구글 시트 셀 영역의 좌상단 첫 번째 셀 경로 (제목행 다음줄의 첫 번째 셀)
   * *************************************************************************/

  return values = {
    DEBUG            : false,

    clientId         : "[네이버 오픈 API용 Client ID]",
    clientSecret     : "[네이버 오픈 API용 Client Secret]",

    keyword          : "[검색키워드]",
    webhook          : "https://chat.googleapis.com/v1/spaces/[SPACE_ID]/messages?key=[KEY]&token=[TOKEN]",
    card             : true,
    allowArchiving   : true,
    spreadsheetId    : "[SPREADSHEET_ID]",
    sheetName        : "[SPREADSHEET_SHEET_NAME]",
    sheetTargetCell  : "[SPREADSHEET_SHEET_NAME]!A2"
  };
}

/***************************************************************************
 * 여기서부터는 꼭 필요한 경우가 아니라면 수정하지 말아주세요.
 * *************************************************************************/

function getFeedUrl(keyword) {

  // 뉴스 검색 결과 출력 건수 지정 (미지정시 기본값 10, 최대 100)
  const display = "50";

  // 뉴스 검색 시작 위치 지정 (미지정시 기본값 1, 최대 1000)
  const start = "1";

  // 뉴스 검색결과 정렬 옵션 (미지정시 기본값 date(날짜순), 이외에 sim(유사도순) 지정 가능)
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
      const description = bleachText(items[i].getChildText('description'));
      const pubDateText = Utilities.formatDate(pubDate, "GMT+9", "yyyy-MM-dd HH:mm:ss");

      // 네이버 뉴스 검색 API에서는 매체명 데이터 필드 미지원 -> 대안 리서치 전까지는 빈 값("")으로 대체
      const author = "";
      
      // DEBUG 모드일 경우 => 챗봇/아카이빙 기능을 정지하고 처리된 데이터를 로그로만 출력시킨다.
      if (g.DEBUG) {
        Logger.log("----- " + items.length + "개 항목 중 " + (i + 1) + "번째 -----");
        Logger.log(pubDateText + "\n" + title + "\n" + link + "\n" + description);
      } 
      
      // DEBUG 모드가 아닐 경우 => 챗봇/아카이빙 기능을 실행한다.
      else {
        Logger.log("'" + title + "' 항목 게시 중...");
        
        postArticle(g.webhook, g.card, pubDateText, title, author, description, link);
        if (g.allowArchiving) {
          archiveItems[archiveItems.length] = [pubDateText, title, "", link, description];
        }
      }

      PropertiesService.getScriptProperties().setProperty('lastArticleUpdateTime', pubDate.getTime());
      cnt++;
    }
  }

  Logger.log("* 총 " + parseInt(cnt, 10) + "건의 항목이 게시되었습니다.");

  if (!g.DEBUG && g.allowArchiving && cnt > 0) {
    archiveArticle(g.spreadsheetId, g.sheetName, g.sheetTargetCell, archiveItems);
  }

}

function postArticle(webhook, card, pubDateText, title, author, description, link) {

  // 구글챗 포스팅 포맷을 Card 형태로 지정했을 경우
  if (card) {
    const article = generateArticleCard(pubDateText, title, author, description, link);
    const params = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(article)
    };

    UrlFetchApp.fetch(webhook, params);
  }

  // 구글챗 포스팅 포맷형식을 일반 텍스트 형태로 지정했을 경우
  else {
    let article = "*";
    if (author != "") {
      article += "[" + author + "] ";
    }
    article += title + "*";
    article += "\n" + pubDateText;
    if (description) {
      article += "\n" + description;
    }
    article += "\n" + link;

    const params = {
      "method" : "post",
      "contentType": "application/json",
      "payload" : JSON.stringify({
        "text": article 
      })
    };

    UrlFetchApp.fetch(webhook, params);
  }
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


function generateArticleCard(pubDateText, title, author, description, link) {
  return card = { 
    cards: [{
      "header": {
        "title": title
      },
      "sections": [{
        "header": author,
        "widgets": [{
          "textParagraph": {
            "text": description
          }
        },
        {  
          "keyValue": {
            "content": pubDateText,
            "icon": "DESCRIPTION",
            "onClick": {
              "openLink": {
                "url": link
              }
            },
            "button": {
              "textButton": {
                "text": "뉴스보기",
                "onClick": {
                  "openLink": {
                    "url": link
                  }
                }
              }
            }
          }
        }]
      }]
    }]
  }
}


function bleachText(text) {

  // 데이터 필드에 포함된 HTML Tag를 제거하고 Entity들을 원래 의도된 특수문자로 대체한다.
  text = text.replace(/(<([^>]+)>)/gi, '');
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#039;/gi, "'");
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/&amp;/gi, '&');

  return text;

}


function runFetchingBot() {

  // 뉴스봇을 처음 실행하는 경우, PropertiesService 객체를 통해 최초 실행 시각과 뉴스봇 구동 여부를 저장 후 종료시킨다.
  if (!PropertiesService.getScriptProperties().getProperty("getArticleInitialized")) {
    PropertiesService.getScriptProperties().setProperty("lastArticleUpdateTime", parseFloat(Date.now()));
    PropertiesService.getScriptProperties().setProperty("getArticleInitialized", true);
    Logger.log("* 초기 설정이 완료되었습니다. 다음 실행때부터 뉴스 항목을 가져옵니다.")
    return;
  }
  
  // 뉴스봇 구동 설정값들을 불러와 네이버 뉴스 피드를 체크한다.
  const g = globalVariables();
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
  }

}
