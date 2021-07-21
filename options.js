let keys = ["origin_font", "origin_color", "trans_font", "trans_color"]

for (let i = 0; i < keys.length; i++){
    let key = keys[i];
    let input = document.getElementsByName(key)[0];
    input.onchange = function(e) {
        let v = {}
        v[key] = e.target.value;
        chrome.storage.sync.set(v);
    }
    chrome.storage.sync.get(key, (item) => {
        if (item[key] != undefined) {
            input.value = item[key];
        }
    });
}
