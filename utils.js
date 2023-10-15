let now = new Date()
//restamos unos dias para la carga inicial
let lastUpdate = now - 1000 * 60 * 60 * 24 * 4
//restamos unos dias para la carga inicial

exports.MINS_TO_REQUEST_ALL_RSS = 1

exports.feedNormalizerMedia = function (elements, feedSource, frontEndImage) {
    let fixedElements = []
    let hasNewElements = false
    elements.forEach((element) => {

        let image = getImage(element)
        let description = removeTags(getDescription(element), "b", "br")

        if (compareDates(element.pubDate, lastUpdate)) {
            console.log("Has New Elements: "+ feedSource)
            hasNewElements = true
        }


        fixedElements.push({
            title: element.title,
            source: feedSource,
            date: element.pubDate,
            description: description,
            link: element.link,
            pubDate: element.pubDate,
            thumbnailUrl: image
        })
    })

    let allFeedsSorted = sortFixedElements(fixedElements)
    return {
        source: feedSource,
        type: "National",
        allFeeds: allFeedsSorted ,
        frontEndImage: frontEndImage,
        hasNewElements: hasNewElements
    }
}


function sortFixedElements(arr) {
    return arr.sort(function (a, b) {
        return new Date(b.pubDate) - new Date(a.pubDate);
    })
}

exports.updateDate  =function () {
//    console.log('Updating Date')
    lastUpdate = new Date()-60000
}

const compareDates = (d1, d2) => {
    let date1 = new Date(d1).getTime();
    let date2 = new Date(d2).getTime();
    if (date1 > date2) {
        return true
    }
};

function getImage(element) {
    let urlRegex = /(https?:\/\/[^ ]*)/;

    try {
        if (element.enclosures[0] && element.enclosures[0].url) {
            return element.enclosures[0].url
        } else if (element["media:content"] && element["media:content"]["@"] && element["media:content"]["@"]["url"]) {
            return element["media:content"]["@"]["url"]
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