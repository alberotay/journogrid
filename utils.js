exports.feedNormalizer = function(elements,feedSource,frontEndImage){
    let fixedElements = []
    elements.forEach((element)=>{
        let image
        try {
        if (!element.enclosure) {
                let urlRegex = /(https?:\/\/[^ ]*)/;
                image = element.content.match(urlRegex)[0].split('.jpg')[0] + '.jpg'

            } else if (element.enclosure) {
                image = element.enclosure.url
            } else {
            return "http://grin2b.com/wp-content/uploads/2017/01/Grin2B_icon_NEWS.png"
            }
        }catch(e){console.log("error getrting image for "+feedSource)}

            fixedElements.push({
            title:element.title,
            source:feedSource,
            date: element.pubDate,
            description:element.contentSnippet,
            link:element.link,
            pubDate:element.pubDate,
            thumbnailUrl:image
        })})
    return {source : feedSource,
        type : "National",
        allFeeds : fixedElements,
        frontEndImage:frontEndImage}
}

exports.feedNormalizerMedia = function(elements,feedSource,frontEndImage){
    let fixedElements = []
    elements.forEach((element)=>{

        function getImage  (element) {
            try {
                return element["media:content"]["@"]["url"]
            } catch (e) {
                console.log(e)
                return "http://grin2b.com/wp-content/uploads/2017/01/Grin2B_icon_NEWS.png"

            }
        }
        let image = getImage(element)

        fixedElements.push({
                title:element.title,
                source:feedSource,
                date: element.pubDate,
                description:element["rss:description"]["#"],
          //      description:element.description,
                link:element.link,
                pubDate:element.pubDate,
                thumbnailUrl:image
           })})



   return    {source : feedSource,
              type : "National",
              allFeeds : fixedElements,
              frontEndImage:frontEndImage}
}
