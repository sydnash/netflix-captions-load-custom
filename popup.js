//const moment = require('moment')
// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

//chrome.storage.sync.get("color", ({
//    color
//}) => {
//    changeColor.style.backgroundColor = color;
//});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
    //let [tab] = await chrome.tabs.query({
    //    active: true,
    //    currentWindow: true
    //});

    //chrome.scripting.executeScript({
    //    target: {
    //        tabId: tab.id
    //    },
    //    function: setPageBackgroundColor,
    //});
    console.log("start click")
    upload();
});

// The body of this function will be executed as a content script inside the
// current page
//function setPageBackgroundColor() {
//    chrome.storage.sync.get("color", ({
//        color
//    }) => {
//        document.body.style.backgroundColor = color;
//    });
//}

function upload() {
    var inputObj = document.createElement('input')
    inputObj.setAttribute('id', 'file');
    inputObj.setAttribute('type', 'file');
    inputObj.setAttribute('name', 'file');
    inputObj.setAttribute("style", 'visibility:hidden');
    document.body.appendChild(inputObj);
    inputObj.value;
    inputObj.click();
    document.querySelector('#file').addEventListener('change', e => {
        for (let entry of e.target.files) {
            console.log(entry.name, entry.webkitRelativePath);
            parseDFXP(entry);
        }
    });
}

var currentCaptions = [];

function parseDFXP(file) {
    var reader = new FileReader(); 
    reader.readAsText(file);
    reader.onloadend = function(event) {
        console.log(event.target.result);
        let parser = new DOMParser();
        let doc = parser.parseFromString(event.target.result, 'text/xml');
        let root = doc.getElementsByTagName('div')[0];
        currentCaptions.splice(0, currentCaptions.length);
        let ps = root.children;
        for (let i = 0; i < ps.length; i++) {
            let ele = ps.item(i);
            let begin = parseTime(ele.getAttribute('begin'));
            let end =  parseTime(ele.getAttribute('end'));
            let text = ele.textContent;
            let v = {
                "begin": begin,
                "end" : end,
                "text" : text,
            };
            currentCaptions.push(v);
        }
        console.log(currentCaptions)
        chrome.storage.local.set({ currentCaptions: currentCaptions });
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
