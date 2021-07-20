console.log("content js is executed")

var curCaptions = null;
var timeoffset = 0;

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
    if (cap == 'undefined') {
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

var mainDiv = document.createElement('div');
mainDiv.className = "cap-s-top-right"
mainDiv.id = "maindiv"

let btns = ["load", "add", "del"];
let fns = [upload, ];
for (let i = 0; i < btns.length; i++) {
    let name = btns[i];
    let btn = document.createElement('button')
    btn.textContent = name
    btn.id = name
    mainDiv.appendChild(btn)

    if (i < fns.length) {
        btn.addEventListener("click", fns[i]);
    }
}

document.body.appendChild(mainDiv)


let curTime = 0;
let timeout = 100;
let loop = function() {
    if (curCaptions != null) {
        curTime += timeout;
        console.log(binaraySearch(curCaptions, curTime));
    }
    setTimeout(loop, timeout);
}
setTimeout(loop, timeout);
