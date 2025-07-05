const md5 = require("md5")
// ==============================
//  feedNormalizerMedia
//  Normaliza y transforma los objetos noticia crudos en un formato homogéneo y utilizable por el sistema
//  Extrae y limpia campos clave (título, fecha, imagen, vídeo, descripción, etc.)
// ==============================

exports.feedNormalizerMedia = function (elements, feedSource, frontEndImage, category) {
    let fixedElements = []
    elements.forEach((element) => {
        let image = getImage(element)
        let description = removeTags(getDescription(element), "b", "br")
        let pubDate = new Date(getDate(element));
        let videoUrl = getVideo(element);
        fixedElements.push({
            id:md5(element.title),
            pubDate: pubDate.getTime(),
            title: element.title,
            source: feedSource,
            description: description,
            link: element.link,
            thumbnailUrl: image,
            isNew: false,
            category: category,
            videoUrl: videoUrl
        })
    })

    let allFeedsSorted = sortBy(fixedElements, 'pubDate'); // Ordena por fecha de publicación (más reciente primero)
    return allFeedsSorted;
}


// ==============================
// Función auxiliar para ordenar arrays de objetos por un campo numérico
// ==============================

function sortBy(arr, prop) {
    return arr.sort((a, b) => b[prop] - a[prop]);
}
// ==============================
// Extrae la imagen principal de un objeto noticia, probando varios formatos estándar de RSS
// ==============================

function getImage(element) {
    let urlRegex = "<img[^>]* src=\"([^\"]*)\"[^>]*>";

    try {
        if (element.enclosures[0] && element.enclosures[0].url) {
            return element.enclosures[0].url
        } else if (element["media:content"] && element["media:content"]["@"] && element["media:content"]["@"]["url"]) {
            return element["media:content"]["@"]["url"]
        } else if (element.image && element.image.url) {
            return element.image.url
        } else if (element["atom:link"] && element["atom:link"]["media:content"] && element["atom:link"]["media:content"]["media:thumbnail"]) {
            return element["atom:link"]["media:content"]["media:thumbnail"][0]["@"].url
        } else if (element.description.match(urlRegex)) {
            return element.description.match(urlRegex)[1]
        } else {
            return ""
        }
    } catch (e) {
        return ""
    }
}

// ==============================
// Extrae un enlace de vídeo del objeto noticia, buscando en enclosure, media:content y código embebido
// ==============================

function getVideo(element) {
    // 1. Enclosure directo (array)
    if (element.enclosures && element.enclosures.length > 0) {
        const video = element.enclosures.find(e => e.type && e.type.startsWith("video/"));
        if (video && video.url) {
            //console.log(`[getVideo] Vídeo encontrado en enclosure: ${video.url}`);
            return video.url;
        }
    }
    // 2. Buscar en media:content (puede ser objeto o array)
    if (element["media:content"]) {
        let media = element["media:content"];
        if (Array.isArray(media)) {
            media = media.find(m =>
                (m["@"] && m["@"].type && m["@"].type.startsWith("video/")) ||
                (m.type && m.type.startsWith("video/"))
            );
        }
        // Caso objeto con atributos
        if (media && media["@"] && media["@"].type && media["@"].type.startsWith("video/") && media["@"].url) {
            //console.log(`[getVideo] Vídeo encontrado en media:content (@): ${media["@"].url}`);
            return media["@"].url;
        }
        // Caso objeto plano
        if (media && media.url && media.type && media.type.startsWith("video/")) {
            //onsole.log(`[getVideo] Vídeo encontrado en media:content (plano): ${media.url}`);
            return media.url;
        }
    }
    // 3. Otras opciones: buscar <video> o <iframe> embebido en la descripción
   if (element.description) {
    let regexVideo = /<video[^>]+src="([^"]+)"/i;
    let regexIframe = /<iframe[^>]+src="([^"]+)"/i;
    let match = element.description.match(regexVideo) || element.description.match(regexIframe);
    if (match) {
        //console.log(`[getVideo] Vídeo encontrado en description embebido: ${match[1]}`);
        return match[1];
    }
}
}
// ==============================
// Extrae la descripción principal del objeto noticia, probando varios formatos estándar de RSS
// ==============================
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
// ==============================
// Extrae la fecha de publicación (puede venir en distintos campos según el RSS)
// ==============================

function getDate(element) {
    if (element["dc:created"]) {
        return element["dc:created"]["#"]
    } else {
        return element.pubDate
    }
}

// ==============================
// Elimina etiquetas HTML de un string, permitiendo opcionalmente algunas (como <b>, <br>, etc.)
// ==============================
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


//function timeout(ms) {
//    return new Promise(resolve => setTimeout(resolve, ms));
//}

//exports.sleep = async function (ms) {
//    await timeout(ms);
//}

// ==============================
// sortForClient: Marca como "nueva" cada noticia que haya llegado después del lastView del usuario
// También marca el feed como que tiene novedades, para resaltar en el frontend
// ==============================
exports.sortForClient = function (sortedForClient, lastView) {
    if (sortedForClient.length > 0) {
        sortedForClient.forEach((y) => {
            y.allFeeds.forEach((feed) => {
                const feedPubDateMs = feed.pubDate ? new Date(feed.pubDate).getTime() : NaN;
                const horaEntradaBDMs = feed.horaEntradaBD ? new Date(feed.horaEntradaBD).getTime() : NaN;
                // Logs de depuración para cada campo
                // Logs de depuración para cada campo
                //    console.log(`feed.pubDate:`, feed.pubDate, `=>`, feedPubDateMs, isNaN(feedPubDateMs) ? '(NaN)' : `(${new Date(feedPubDateMs).toISOString()})`);
                //    console.log(`feed.horaEntradaBD:`, feed.horaEntradaBD, `=>`, horaEntradaBDMs, isNaN(horaEntradaBDMs) ? '(NaN)' : `(${new Date(horaEntradaBDMs).toISOString()})`);

                // Elige la fecha más reciente disponible
                const fechaReferencia = Math.max(feedPubDateMs, horaEntradaBDMs);

                //Logs para diagnóstico
                // const titulo = feed.title || '[Sin título]';
                //const fuente = y.source || y.name || '[Sin fuente]';
                //const fechaRefISO = !isNaN(fechaReferencia) ? new Date(fechaReferencia).toISOString() : 'Invalid Date';
                //const lastViewISO = Number.isFinite(lastView) ? new Date(lastView).toISOString() : 'Invalid Date';
                //const diffMs = fechaReferencia - lastView;
                const entra = !isNaN(fechaReferencia) && lastView < fechaReferencia;
                //const color = entra ? '\x1b[32m' : '\x1b[31m';
                //const reset = '\x1b[0m';

                //console.log(`${color}[sortForClient] ${fuente} :: "${titulo}" - fechaRef: ${fechaReferencia} (${fechaRefISO}), lastView: ${lastView} (${lastViewISO}), diferencia: ${diffMs} ms ==> ${entra ? 'NUEVA' : 'NO NUEVA'}${reset}`);

                // Lógica de marcado
                if (entra) {
                    feed.isNew = true;
                    y.hasNewElements = true;
                }
            });
        });
    }
    return sortedForClient;
};


