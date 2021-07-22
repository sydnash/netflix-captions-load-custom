let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
    let items = {
        'origin_color': "#FFFFFF",
        'origin_weight': "bold",
        'origin_font': "35",
        'trans_color': "#FFFFFF",
        'trans_weight': "bold",
        'trans_font': "35",
    }
    chrome.storage.sync.set(items);
    console.log('Default background color set to %cgreen', `color: ${color}`);
});

