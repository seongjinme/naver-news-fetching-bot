function globalVariables() { 
  return values = {

    // 디버그 모드 (true/false, 기본값: false)
    DEBUG: false,

    // 모니터링할 네이버뉴스 검색어
    keyword: "[KEYWORD]",

    // 구글챗 스페이스(Google Chat Space) 공간에 설정된 웹훅(Webhook) URL
    webhook: "https://chat.googleapis.com/v1/spaces/[SPACE_ID]/messages?key=[KEY]&token=[TOKEN]",

    // 구글챗 스페이스(Google Chat Space) 공간에 전송될 뉴스 항목의 카드 포맷 전송 여부 (true/false, 기본값: true)
    card: true,

    // 뉴스 항목의 구글 스프레드시트 아카이빙 허용 여부 (true/false, 기본값: true)
    allowArchiving: true,

    // 뉴스 항목을 아카이빙할 구글 스프레드시트 문서 ID값
    spreadsheetId: "[SPREADSHEET_ID]",

    // 뉴스 항목을 아카이빙할 구글 스프레드시트 문서의 해당 시트 이름
    sheetName: "[SHEET_NAME]",

    // 새로 받은 뉴스 항목이 업데이트될 셀 영역의 좌상단 첫 번째 셀 경로 (제목행 다음줄의 첫 번째 셀)
    sheetTargetCell: "[SHEET_NAME]!A2"

  };
}

function getArticle() {

  if (!PropertiesService.getScriptProperties().getProperty("getArticleInitialized")) {
    PropertiesService.getScriptProperties().setProperty("lastArticleUpdateTime", parseFloat(Date.now()));
    PropertiesService.getScriptProperties().setProperty("getArticleInitialized", true);
    Logger.log("* 초기 설정이 완료되었습니다. 다음 실행 때부터 지금 시각 이후에 게재된 최신 뉴스를 가져옵니다.")
  }

  else {
    const g = globalVariables();
    const feedUrl = "http://newssearch.naver.com/search.naver?where=rss&query=" + g.keyword + "&field=0&is_dts=0"

    const lastArticleUpdateTime = new Date(parseFloat(PropertiesService.getScriptProperties().getProperty("lastArticleUpdateTime")));

    Logger.log("* 마지막 기사 업데이트 시점 : " + lastArticleUpdateTime);
    Logger.log("* 네이버뉴스 키워드 검색 시작 : '" + g.keyword + "'");

    const xml = XmlService.parse(UrlFetchApp.fetch(feedUrl).getContentText());
    const items = xml.getRootElement().getChild('channel').getChildren('item').reverse();

    let cnt = 0;
    let archiveItems = [];

    for (let i = 0; i < items.length; i++) {

      const pubDate = new Date(items[i].getChildText('pubDate'));

      if (pubDate > lastArticleUpdateTime) {

        const title = items[i].getChildText('title');
        const link = items[i].getChildText('link');
        const description = items[i].getChildText('description');
        const pubDateText = Utilities.formatDate(pubDate, "GMT+9", "yyyy-MM-dd HH:mm:ss");
        const author = items[i].getChildText('author');
        const category = items[i].getChildText('category');
        const media = items[i].getChild('thumbnail', XmlService.getNamespace("http://search.yahoo.com/mrss/"));
        const image = media ? media.getAttribute('url').getValue() : null;

        // DEBUG 모드일 경우 => 챗봇/아카이빙 기능을 정지하고 처리된 데이터를 로그에만 기록한다.
        if (g.DEBUG) {
          Logger.log("----- " + (cnt + 1) + "번째 뉴스 항목 -----");
          Logger.log(pubDateText + "\n" + title + "\n" + author + "\n" + link + "\n" + category + "\n" + description + "\n" + image);
        } 
        
        // DEBUG 모드가 아닐 경우 => 챗봇/아카이빙 기능을 실행한다.
        else {
          Logger.log("'" + title + "' 항목 게시 중...");
          
          postArticle(g.webhook, g.card, pubDateText, title, author, category, description, link, image);
          if (g.allowArchiving) {
            archiveItems[archiveItems.length] = [pubDateText, title, author, category, link, description];
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
}

function postArticle(webhook, card, pubDateText, title, author, category, description, link, image) {

  // 구글챗 포스팅 포맷을 Card 형태로 지정했을 경우
  if (card) {
    const article = generateArticleCard(pubDateText, title, author, category, description, link, image);
    const params = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(article)
    };

    UrlFetchApp.fetch(webhook, params);
  }

  // 구글챗 포스팅 포맷형식을 일반 텍스트 형태로 지정했을 경우
  else {
    let article = "*" + "[" + author + "] " + title + "*";
    article += "\n" + pubDateText;
    if (category) {
      article += "\n" + category;
    }
    if (description) {
      article += "\n" + description;
    }
    article += "\n" + link;

    const params = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify({
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
    headerRange.values = [["날짜/시각", "제목", "매체명", "카테고리", "URL", "내용"]];

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

function generateArticleCard(pubDateText, title, author, category, description, link, image) {
  return card = { 
    cards: [{
      "header": {
        "title": title,
        "imageUrl": image
      },
      "sections": [{
        "header": author + " - " + category,
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
