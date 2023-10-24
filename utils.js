let now = new Date()
//restamos unos dias para la carga inicial
let lastUpdate = now - 1000 * 60 * 60 * 24 * 4
//restamos unos dias para la carga inicial

exports.MINS_TO_REQUEST_ALL_RSS = 1

exports.feedNormalizerMedia = function (elements, feedSource, frontEndImage,category) {
    let fixedElements = []
    elements.forEach((element) => {
        let image = getImage(element)
        let description = removeTags(getDescription(element), "b", "br")
        let pubDate = new Date(getDate(element));
        fixedElements.push({
            pubDate: pubDate.getTime(),
            title: element.title,
            source: feedSource,
            description: description,
            link: element.link,
            thumbnailUrl: image,
            isNew: false,
            category: category
        })
    })

    let allFeedsSorted = sortBy(fixedElements, 'pubDate');
    return {
        source: feedSource,
        category: category,
        allFeeds: allFeedsSorted ,
        frontEndImage: frontEndImage,
        hasNewElements: false
   }
}

function sortBy(arr, prop) {
    return arr.sort((a, b) => b[prop] - a[prop]);
}




function getImage(element) {
    let urlRegex = /(https?:\/\/[^ ]*)/;

    try {
        if (element.enclosures[0] && element.enclosures[0].url) {
            return element.enclosures[0].url
        } else if (element["media:content"] && element["media:content"]["@"] && element["media:content"]["@"]["url"]) {
            return element["media:content"]["@"]["url"]
        } else if (element.image && element.image.url) {
            return element.image.url
        } else if (element.description.match(urlRegex)[0].split('.jpg')[0]) {
            return element.description.match(urlRegex)[0].split('.jpg')[0] + '.jpg'
        } else {
            return ""
        }
    } catch (e) {
        return ""
    }
}

function getDescription(element) {
    try {
        if (element.description) {
            return element.description
        } else if (element["rss:description"]["#"]) {
            return element["rss:description"]["#"]
        } else {
            return "";
        }
    } catch (e) {
        return ""
    }
}


function getDate(element){
    if(element["dc:created"]){
        return element["dc:created"]["#"]
    }else{
        return element.pubDate
    }
}

function removeTags(_html) {
    let _tags = [], _tag = "";
    for (var _a = 1; _a < arguments.length; _a++) {
        _tag = arguments[_a].replace(/<|>/g, '').trim();
        if (arguments[_a].length > 0) _tags.push(_tag, "/" + _tag);
    }

    if (!(typeof _html == "string") && !(_html instanceof String)) return "";
    else if (_tags.length == 0) return _html.replace(/<(\s*\/?)[^>]+>/g, "");
    else {
        let _re = new RegExp("<(?!(" + _tags.join("|") + ")\s*\/?)[^>]+>", "g");
        return _html.replace(_re, '');
    }
}


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.sleep = async function (ms) {
    await timeout(ms);
}

exports.sortForClient = function (sortedForClient,lastView){
    if (sortedForClient.length > 0) {
        sortedForClient.forEach((y) => {
            y.allFeeds.forEach((feed) => {
                if (lastView < feed.pubDate) {
                    feed.isNew = true
                    y.hasNewElements = true
                }
            })
        })
    }
    return sortedForClient
}