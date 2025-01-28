'use strict';
let utils = require("../utils");
let  myParser =require("../feedParser");
let mongoWrapper = require("../db/mongoWrapper")

class feedItems {
    constructor(elementSource,url,category) {
        this.url = url;
        this.elementSource = elementSource;
        this.frontendImage = "/logos/"+this.elementSource+".svg";
        this.elements = [];
        this.category = category;
        
    }


    async parseItems(){
        this.elements = await myParser.parseMedia(this.url)
        let feedsNormalized = utils.feedNormalizerMedia(this.elements, this.elementSource,this.frontendImage,this.category)
        this.storeNews(feedsNormalized)

    }

    async getItems() {
            return {
            source: this.elementSource,
            category: this.category,
            allFeeds: await this.getNews(this.elementSource),
            frontEndImage: this.frontendImage,
            hasNewElements: false
        }
    }

     storeNews(newsArray){
            mongoWrapper.storeNewsByArray(newsArray)
    }

    async getNews(){
        let toReturn = await mongoWrapper.getNewsBySource(this.elementSource)
        console.log("enGetNews: " +toReturn)
        return toReturn
    }
}

module.exports = feedItems;