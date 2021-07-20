console.log("content js is executed")

var curCaptions = null;
var timeoffset = 0;
var tswitch = true;
var listStyle = [];
var netFlixInit = false;


const getOriginText = () => {
    let obj_text = '';
    let a = $('.player-timedtext-text-container')
        .find('span');
    for (let i = 0; i < a.length; i++) {
        let span = a[i];
        obj_text += (span.innerText + ' ')
            .replace('<br>', ' ')
            .replace(/\[(.+)\]/, '');
    }
    return obj_text;
};

/**
 * replace subtitle to screen
 * @param domClass
 * @param textInfo:object {origin,translate}
 */
function dealSubtitle(
    domClass,
    request
) {
    chrome.storage.sync.get(null, (items) => {
        items = {
            'origin_color': "#FFFFFF",
            'origin_weight': "bold",
            'origin_font': "15",
            'trans_color': "#FFFFFF",
            'trans_weight': "bold",
            'trans_font': "15",
        }
        const subtitle = `<div class="SUBTILTE"
    style="
    position: absolute;
    bottom:30px;
    width:100%;
    text-align: center;
    margin: 0 .5em 1em;
    padding: 20px 8px;
    white-space: pre-line;
    writing-mode: horizontal-tb;
    unicode-bidi: plaintext;
    direction: ltr;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
    background: ${items['backgroundColor']};
    opacity: ${items['backgroundOpacity']};
  ">
     <div class="origin_subtitle"
      style="
          color:${items['origin_color']} !important;
          font-weight:${items['origin_weight']} !important;
          font-size:${items['origin_font']}px !important;;
      "
     >${request.origin}</div>
      <div class="translate_subtitle"
      style="
          color: ${items['trans_color']} !important;
          font-weight:${items['trans_weight']} !important;
          font-size: ${items['trans_font']}px !important;
      "
      >${request.translate}</div>
  </div>`;
        let hasSubtitleDom = $('div.SUBTILTE').length === 0;
        if (hasSubtitleDom) {
            $(domClass).after(subtitle);
        } else {
            $('div.SUBTILTE').remove();
            $(domClass).after(subtitle);
        }
    });
}


/**
 * hidden subtitle function
 * @param hideClassName
 */
function hiddenSubtitleCssInject(hideClassName) {
    let css = '';

    hideClassName.forEach((item) => {
        css += `${hideClassName}{display:none !important} \n`;
    });
    let style = $(`<style id='chrome-extension-plugin-css'>
    ${css}
  </style>`);
    $('body').append(style);
    return style;
    // const head = document.getElementsByTagName('head')[0];
    // const style = document.createElement('style');
    // style.id = 'chrome-extension-plugin-css';
    // style.appendChild(document.createTextNode(css));
    // head.appendChild(style);
}

//chrome.storage.local.get('currentCaptions', (
//    currentCaptions
//) => {
//    console.log("123", currentCaptions);
//    curCaptions = currentCaptions.currentCaptions;
//});


//"begin": begin,
//"end" : end,
//"text" : text,
function binaraySearch(cap, time) {
    if (cap == null) {
        return ""
    }
    let high = cap.length - 1;
    let low = 0
    while (low <= high) {
        let midd = parseInt((low + high) / 2);
        let ele = cap[midd];
        if (ele.begin <= time && ele.end >= time) {
            return ele.text;
        } else if (time < ele.begin) {
            high = midd - 1;
        } else {
            low = midd + 1;
        }
    }
    return "";
}

function upload() {
    if (document.getElementById('file') != null) {
        let inputObj = document.getElementById('file');
        inputObj.value;
        inputObj.click();
    } else {
        let inputObj = document.createElement('input');
        inputObj.setAttribute('id', 'file');
        inputObj.setAttribute('type', 'file');
        inputObj.setAttribute('name', 'file');
        inputObj.setAttribute("style", 'visibility:hidden');
        document.body.appendChild(inputObj);
        inputObj.value;
        inputObj.click();
    }
    document.querySelector('#file').addEventListener('change', e => {
        for (let entry of e.target.files) {
            console.log(entry.name, entry.webkitRelativePath);
            parseDFXP(entry);
        }
    });
}

function parseDFXP(file) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = function(event) {
        console.log(event.target.result);
        let parser = new DOMParser();
        let doc = parser.parseFromString(event.target.result, 'text/xml');
        let root = doc.getElementsByTagName('div')[0];
        let currentCaptions = [];
        let ps = root.children;
        for (let i = 0; i < ps.length; i++) {
            let ele = ps.item(i);
            let begin = parseTime(ele.getAttribute('begin'));
            let end = parseTime(ele.getAttribute('end'));
            let text = ele.textContent;
            let v = {
                "begin": begin,
                "end": end,
                "text": text,
            };
            currentCaptions.push(v);
        }
        console.log(currentCaptions)
        curCaptions = currentCaptions
    }
}

function parseTime(timestr) {
    let re = /(\d{2}):(\d{2}):(\d{2}).(\d{3})/;
    let matches = re.exec(timestr)
    let ms = 0;
    if (matches.length < 5) {
        return ms
    }
    ms += Number(matches[4]);
    ms += Number(matches[3]) * 1000;
    ms += Number(matches[2]) * 60 * 1000;
    ms += Number(matches[1]) * 60 * 60 * 1000;
    return ms
}

function modifyOffset(ms) {
    timeoffset += ms;
    console.log("timeoffset is: ", timeoffset);
}

function add() {
    modifyOffset(50)
}

function del() {
    modifyOffset(-50)
}

function switchfn() {
    tswitch = !tswitch;
    processSubtitle();
}

function processSubtitle() {
    if (!netFlixInit) {
        return
    }
    if (tswitch) {
        listStyle = []
        listStyle.push(hiddenSubtitleCssInject([
            '.player-timedtext-text-container',
            '.mejs-captions-text',
        ]))
    } else {
        listStyle.forEach((item) => item.remove());
        $('.SUBTILTE').remove();
    }
}

function initVideo() {
    let videoPlayers = document.body.getElementsByTagName('video');
    if (videoPlayers.length > 0) {
        let player = videoPlayers[0];
        player.ontimeupdate = function (e) { 
            let ct = e.target.currentTime * 1000;
            ct += timeoffset;
            let cap = binaraySearch(curCaptions, ct);
            showCap(cap)
        };
    }
}


var mainDiv = document.createElement('div');
mainDiv.className = "cap-s-top-right"
mainDiv.id = "maindiv"

let btns = ["load", "add", "del", "switch"];
let fns = [upload, add, del, switchfn];
for (let i = 0; i < btns.length; i++) {
    let name = btns[i];
    let btn = document.createElement('cap-button');
    btn.textContent = name;
    btn.id = name;
    mainDiv.appendChild(btn);

    if (i < fns.length) {
        btn.addEventListener("click", fns[i]);
    }
}
document.body.appendChild(mainDiv);

var hasNetflix = window.location.href.includes("netflix");
console.log("has netflix", hasNetflix)
if (hasNetflix) {
    $('body').on(
        'DOMNodeInserted',
        '.player-timedtext-text-container',
        function() {
            netFlixInit = true;
            processSubtitle();
            initVideo();
        }
    );
}

function showCap(str) {
    console.log(str)
    if (hasNetflix && netFlixInit && tswitch) {
        let ori = getOriginText();
        let request = {
            "origin": ori,
            "translate": str,
        };
        dealSubtitle('.player-timedtext', request);
    }
}

// use timer
//let curTime = 0;
//let timeout = 100;
//let loop = function() {
//    if (curCaptions != null) {
//        curTime += timeout;
//        let cap = binaraySearch(curCaptions, curTime + timeoffset);
//        showCap(cap);
//    }
//    setTimeout(loop, timeout);
//}
//setTimeout(loop, timeout);
//

