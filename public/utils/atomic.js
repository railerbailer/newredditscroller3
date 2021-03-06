import {
  gifsArray,
  sfwarray,
  straight,
  artArray,
  foodArray,
  animalsArray
} from "./subredditsArrayConstants.js";
import _ from "lodash";

export const dataHandler = (value = "") => {
  const lowerCaseCategory = value.toLowerCase();
  if (lowerCaseCategory === "nsfw") {
    return _.uniq(straight);
  } else if (lowerCaseCategory === "sfw") {
    return _.uniq(sfwarray.concat(artArray, foodArray, animalsArray));
  } else if (lowerCaseCategory === "sfw") {
    return sfwarray;
  } else if (lowerCaseCategory === "art") {
    return artArray;
  } else if (lowerCaseCategory === "food") {
    return foodArray;
  } else if (lowerCaseCategory === "animals") {
    return animalsArray;
  } else if (
    lowerCaseCategory === "search" ||
    lowerCaseCategory === "allsubreddits"
  ) {
    return _.uniq(
      sfwarray.concat(artArray, foodArray, animalsArray, straight, gifsArray)
    );
  } else {
    return _.uniq(
      sfwarray.concat(artArray, foodArray, animalsArray, gifsArray)
    );
  }
};

export const shuffleArray = array => {
  let random = Math.floor(Math.random() * array.length);
  return array[random];
};

export const htmlParser = string => {
  let editedString = "";
  editedString =
    string &&
    string
      .replace(/&gt;/gi, ">")
      .replace(/&lt;/gi, "<")
      .replace(/&amp;/gi, "&");
  return editedString ? editedString : "";
};

export const imageRatioCalculator = (height, width) => {
  let ratio = height / width;
  if (ratio < 0.7) return "superWide";

  if (ratio >= 0.7 && ratio < 0.9) return "veryWide";

  if (ratio >= 0.9 && ratio < 1.2) return "rectangular";

  if (ratio >= 1.2 && ratio < 1.5) return "veryTall";

  if (ratio >= 1.5) return "superTall";
};

export const dataMapper = (fetchedData, mobile, isNsfw = true) => {
  let convertedSources = [];
  fetchedData.map((item, i) => {
    let mediaData = {};
    const { data } = item;
    const {
      preview,
      post_hint,
      thumbnail_height = 1,
      thumbnail_width = 2,
      thumbnail,
      permalink = "https://www.reddit.com"
    } = data;
    const isGif = data.url.includes(".gif");
    const urlToSource = "https://www.reddit.com" + permalink;
    if (
      preview &&
      preview.reddit_video_preview &&
      preview.reddit_video_preview.scrubber_media_url
    ) {
      imageRatioCalculator(
        preview.reddit_video_preview.height,
        preview.reddit_video_preview.width
      );
      mediaData.video = {};
      mediaData.video.url = preview.reddit_video_preview.scrubber_media_url;
      if (mediaData.video.url.includes("DASH_96"))
        mediaData.video.url = mediaData.video.url.replace(
          "DASH_96",
          "DASH_240"
        );
      mediaData.video.height = preview.reddit_video_preview.height;
      mediaData.video.width = preview.reddit_video_preview.width;
      mediaData.video.className = imageRatioCalculator(
        preview.reddit_video_preview.height,
        preview.reddit_video_preview.width
      );
      let low = "";
      const { resolutions } = preview.images[0];
      low = htmlParser(resolutions[resolutions.length - 1].url || "");
      if (low) {
        mediaData.video.image = low;
      }
      mediaData.video.poster = data.thumbnail;
      mediaData.domain = data.domain || "";
      mediaData.title = data.title;
      mediaData.thumbnail = thumbnail;
      mediaData.permalink = urlToSource;
    } else if (isGif) {
      mediaData.gif = {};
      mediaData.gif.url = data.url.replace(".gifv", ".gif");
      mediaData.gif.className = imageRatioCalculator(
        thumbnail_height,
        thumbnail_width
      );
      mediaData.domain = data.domain || "";
      mediaData.title = data.title;
      mediaData.thumbnail = thumbnail;
      mediaData.permalink = urlToSource;
    } else if (post_hint === "image" || post_hint === "link") {
      mediaData.image = {};
      let low;
      let high;
      preview &&
        preview.images[0] &&
        preview.images[0].resolutions.map(resolution => {
          let res = resolution.height + resolution.width;
          if (res > 500 && res < 1000) {
            low = htmlParser(resolution.url);
          }
          if (res > 1000 && res < 2000) {
            high = htmlParser(resolution.url);
          }
          mediaData.image = {
            source: data.url,
            low: low,
            high: high,
            className: imageRatioCalculator(resolution.height, resolution.width)
          };
          if (mobile && !high && !low) {
            mediaData.image = null;
          }
          if (
            !low &&
            !high &&
            !data.url.includes("imgur" && post_hint === "link")
          ) {
            mediaData.image = null;
          }
          return null;
        });
      mediaData.domain = data.domain || "";
      mediaData.title = data.title;
      mediaData.thumbnail = thumbnail;
      mediaData.permalink = urlToSource;
    }
    if (
      Object.entries(mediaData).length !== 0 &&
      (mediaData.image || mediaData.video || mediaData.gif)
    ) {
      convertedSources.push(mediaData);
      if (convertedSources.length % 10 === 0) {
        const affiliatedAd = createBannerImage();

        convertedSources.push(affiliatedAd);
      }
    }
    return null;
  });

  return convertedSources;
};

const createBannerImage = () => {
  const affilliates = [
    {
      title: "",
      image: {
        source: "/affiliate/images/affiliate-banners-388x388-en-v1.jpg",
        affiliateLink:
          "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=41576&url_id=902",
        low: "/affiliate/images/affiliate-banners-388x388-en-v1.jpg",
        high: "/affiliate/images/affiliate-banners-388x388-en-v1.jpg",
        className: imageRatioCalculator(388, 388)
      }
    },
    {
      title: "",
      image: {
        source: "/affiliate/images/affiliate-banners-388x388-en-v2.jpg",
        affiliateLink:
          "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=41576&url_id=902",
        low: "/affiliate/images/affiliate-banners-388x388-en-v2.jpg",
        high: "/affiliate/images/affiliate-banners-388x388-en-v2.jpg",
        className: imageRatioCalculator(388, 388)
      }
    },
    {
      title: "",
      image: {
        source: "/affiliate/images/affiliate-banners-388x388-en-v3.jpg",
        affiliateLink:
          "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=41576&url_id=902",
        low: "/affiliate/images/affiliate-banners-388x388-en-v3.jpg",
        high: "/affiliate/images/affiliate-banners-388x388-en-v3.jpg",
        className: imageRatioCalculator(388, 388)
      }
    },
    {
      title: "",
      image: {
        source: "/affiliate/images/affiliate-banners-388x388-en-v4.jpg",
        affiliateLink:
          "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=41576&url_id=902",
        low: "/affiliate/images/affiliate-banners-388x388-en-v4.jpg",
        high: "/affiliate/images/affiliate-banners-388x388-en-v4.jpg",
        className: imageRatioCalculator(388, 388)
      }
    },
    {
      title: "",
      image: {
        source: "/affiliate/images/affiliate-banners-388x388-en-v5.jpg",
        affiliateLink:
          "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=41576&url_id=902",
        low: "/affiliate/images/affiliate-banners-388x388-en-v5.jpg",
        high: "/affiliate/images/affiliate-banners-388x388-en-v5.jpg",
        className: imageRatioCalculator(388, 388)
      }
    }
    // {
    //   title: "",
    //   image: {
    //     source: "https://i.imgur.com/N5LKzK8.png",
    //     affiliateLink:
    //       "https://theblueboomers.com/products/blue-boomers%E2%84%A2-blue-light-blocking-specs",
    //     low: "https://i.imgur.com/N5LKzK8.png",
    //     high: "https://i.imgur.com/N5LKzK8.png",
    //     className: imageRatioCalculator(400, 400)
    //   }
    // }
    // {
    //   title: "BUY HERE 👆",
    //   image: {
    //     source: "https://i.imgur.com/N5LKzK8.png",
    //     affiliateLink: "https://www.theblueboomers.com",
    //     low: "https://i.imgur.com/N5LKzK8.png",
    //     high: "https://i.imgur.com/N5LKzK8.png",
    //     className: imageRatioCalculator(400, 400)
    //   }
    // },
    // {
    //   title: "CLICK TO GO TO WEBSITE",
    //   image: {
    //     source: "https://i.imgur.com/ycq9D2Q.png",
    //     affiliateLink: "https://www.theblueboomers.com",
    //     low: "https://i.imgur.com/ycq9D2Q.png",
    //     high: "https://i.imgur.com/ycq9D2Q.png",
    //     className: imageRatioCalculator(400, 200)
    //   }
    // },
    // {
    //   title: "BUY HERE!",
    //   image: {
    //     source: "https://i.imgur.com/ycq9D2Q.png",
    //     affiliateLink: "https://www.theblueboomers.com",
    //     low: "https://i.imgur.com/ycq9D2Q.png",
    //     high: "https://i.imgur.com/ycq9D2Q.png",
    //     className: imageRatioCalculator(400, 200)
    //   }
    // }
    // {
    //   title: "Click for more info",
    //   gif: {
    //     source: "https://www.imglnkd.com/3785/005831A_GDAT_18_ALL_EN_71_L.gif",
    //     url: "https://www.imglnkd.com/3785/005831A_GDAT_18_ALL_EN_71_L.gif",
    //     affiliateLink:
    //       "https://t.mobtyb.com/lw7cqwmj0g?url_id=0&aff_id=112473&offer_id=3785&bo=2753,2754,2755,2756&file_id=334484&po=6456",
    //     low: "https://www.imglnkd.com/3785/005831A_GDAT_18_ALL_EN_71_L.gif",
    //     high: "https://www.imglnkd.com/3785/005831A_GDAT_18_ALL_EN_71_L.gif",
    //     className: imageRatioCalculator(250, 400)
    //   }
    // },
    // {
    //   title: "Click for more info",
    //   gif: {
    //     source: "https://www.imglnkd.com/3785/005831A_GDAT_18_ALL_EN_71_L.gif",
    //     url: "https://www.imglnkd.com/3785/005831A_GDAT_18_ALL_EN_71_L.gif",
    //     affiliateLink:
    //       "https://t.mobtyb.com/1pvn8k2n5s?url_id=0&aff_id=112473&offer_id=3785&bo=2753,2754,2755,2756",
    //     low: "https://www.imglnkd.com/3785/005831A_GDAT_18_ALL_EN_71_L.gif",
    //     high: "https://www.imglnkd.com/3785/005831A_GDAT_18_ALL_EN_71_L.gif",
    //     className: imageRatioCalculator(250, 400)
    //   }
    // },
    // {
    //   title: "Click for more info",
    //   gif: {
    //     source: "https://www.imglnkd.com/3785/006699A_GDAT_18_ALL_EN_71_L.gif",
    //     url: "https://www.imglnkd.com/3785/006699A_GDAT_18_ALL_EN_71_L.gif",
    //     affiliateLink:
    //       "https://t.mobtyb.com/1pvn8k2n5s?url_id=0&aff_id=112473&offer_id=3785&bo=2753,2754,2755,2756",
    //     low: "https://www.imglnkd.com/3785/006699A_GDAT_18_ALL_EN_71_L.gif",
    //     high: "https://www.imglnkd.com/3785/006699A_GDAT_18_ALL_EN_71_L.gif",
    //     className: imageRatioCalculator(250, 400)
    //   }
    // {
    //   title: "Click for more info",
    //   gif: {
    //     source: "https://www.imglnkd.com/3785/006699A_GDAT_18_ALL_EN_71_L.gif",
    //     url: "https://www.imglnkd.com/3785/006699A_GDAT_18_ALL_EN_71_L.gif",
    //     affiliateLink:
    //       "https://t.mobtyb.com/431u2zk5fk?url_id=0&aff_id=112473&offer_id=3785&bo=2753,2754,2755,2756&file_id=334490&po=6456",
    //     low: "https://www.imglnkd.com/3785/006699A_GDAT_18_ALL_EN_71_L.gif",
    //     high: "https://www.imglnkd.com/3785/006699A_GDAT_18_ALL_EN_71_L.gif",
    //     className: imageRatioCalculator(250, 400)
    //   }
    // }
    // {
    //   title: "Click for more info",
    //   image: {
    //     source: "https://www.imglnkd.com/6132/008542A_SXEM_18_ALL_EN_71_L.jpg",
    //     url: "https://www.imglnkd.com/6132/008542A_SXEM_18_ALL_EN_71_L.jpg",
    //     affiliateLink:
    //       "https://t.grtyi.com/6b6blyferk?url_id=0&aff_id=112473&offer_id=6132&bo=3511,3512,3521,3522&file_id=377731",
    //     low: "https://www.imglnkd.com/6132/008542A_SXEM_18_ALL_EN_71_L.jpg",
    //     high: "https://www.imglnkd.com/6132/008542A_SXEM_18_ALL_EN_71_L.jpg",
    //     className: imageRatioCalculator(250, 400)
    //   }
    // },
    // {
    //   title: "Click for more info",
    //   gif: {
    //     source: "https://www.imglnkd.com/6132/008541A_SXEM_18_ALL_EN_71_L.gif",
    //     url: "https://www.imglnkd.com/6132/008541A_SXEM_18_ALL_EN_71_L.gif",
    //     affiliateLink:
    //       "https://t.grtyi.com/d339lamu9s?url_id=0&aff_id=112473&offer_id=6132&bo=3511,3512,3521,3522&file_id=377741",
    //     low: "https://www.imglnkd.com/6132/008541A_SXEM_18_ALL_EN_71_L.gif",
    //     high: "https://www.imglnkd.com/6132/008541A_SXEM_18_ALL_EN_71_L.gif",
    //     className: imageRatioCalculator(250, 400)
    //   }
    // },
    // {
    //   title: "Click for more info",
    //   gif: {
    //     source: "https://www.imglnkd.com/2994/008617A_ROYA_18_ALL_EN_71_L.gif",
    //     url: "https://www.imglnkd.com/2994/008617A_ROYA_18_ALL_EN_71_L.gif",
    //     affiliateLink:
    //       "https://t.hrtyj.com/lsd36dyzr4?url_id=0&aff_id=112473&offer_id=2994&bo=2779,2778,2777,2776,2775&file_id=383057&po=6533",
    //     low: "https://www.imglnkd.com/2994/008617A_ROYA_18_ALL_EN_71_L.gif",
    //     high: "https://www.imglnkd.com/2994/008617A_ROYA_18_ALL_EN_71_L.gif",
    //     className: imageRatioCalculator(250, 400)
    //   }
    // }
  ];
  return _.sample(affilliates);
};
