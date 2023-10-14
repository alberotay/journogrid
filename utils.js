let now  = new Date()
//restamos unos dias para la carga inicial
let lastUpdate =  now - 1000 * 60 * 60 * 24 * 4

//restamos unos dias para la carga inicial



exports.feedNormalizer = function(elements,feedSource,frontEndImage){
    let fixedElements = []
    let hasNewElements = false
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
        }catch(e){
            //console.log("error getrting image for "+feedSource)//
        }
        if(compareDates(element.pubDate,lastUpdate)){
            hasNewElements = true
        }
            fixedElements.push({
            title:element.title,
            source:feedSource,
            date: element.pubDate,
            description:element.contentSnippet,
            link:element.link,
            pubDate:element.pubDate,
            thumbnailUrl:image
        })})

    if(hasNewElements ===true){
        console.log("!!!!!!!!!!!!!!!!!!!!!New feeds for: "+ feedSource);
    }

    return {source : feedSource,
        type : "National",
        allFeeds : sortFixedElements(fixedElements),
        frontEndImage:frontEndImage,
        hasNewElements : hasNewElements
    }
}

exports.feedNormalizerMedia = function(elements,feedSource,frontEndImage){
    let fixedElements = []
    let hasNewElements = false
    elements.forEach((element)=>{

        function getImage  (element) {
            try {
                return element["media:content"]["@"]["url"]
            } catch (e) {
  //              console.log(e)
                return "http://grin2b.com/wp-content/uploads/2017/01/Grin2B_icon_NEWS.png"

            }
        }
        let image = getImage(element)

        if(compareDates(element.pubDate,lastUpdate)){
            hasNewElements = true
        }

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


   if(hasNewElements ===true){
       console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!New feeds for: "+ feedSource)
   }

   return    {source : feedSource,
              type : "National",
              allFeeds : sortFixedElements(fixedElements),
              frontEndImage:frontEndImage,
              hasNewElements:hasNewElements}
}




function sortFixedElements(arr){
  return   arr.sort(function(a,b){
           return new Date(b.pubDate) - new Date(a.pubDate);
    })
}

exports.updateDate = function () {
    console.log("updateding date from " + lastUpdate.toString())
    lastUpdate = new Date()
    console.log("to " + lastUpdate.toString())
}

const compareDates = (d1, d2) => {
    let date1 = new Date(d1).getTime();
    let date2 = new Date(d2).getTime();
    console.log(date1)
    console.log(date2)
    console.log("Evaluating Dates")
    if (date1 > date2) {
        console.log(`pubdate  ${d1} is greater than ${d2}`);
        return true
    }
};

