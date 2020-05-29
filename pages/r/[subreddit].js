import Router, { withRouter } from "next/router";
import React, { Component } from "react";
import { Swipeable } from "react-swipeable";
import "antd/dist/antd.css";
import "../../App.css";
import _ from "lodash";
import AddMarkup from "../../components/addMarkup";
import { Icon, message, Empty, Button } from "antd";
import {
  dataHandler,
  shuffleArray,
  dataMapper
} from "../../public/utils/atomic";
import LoginModal from "../../components/loginModal";
import SearchComponent from "../../components/search";
import SwitchCategoryButtons from "../../components/switchCategoryButtons";
import MainDropDownMenu from "../../components/mainDropDownMenu";
import GoBackButton from "../../components/goBackButton";
import "isomorphic-fetch";
import Head from "next/head";
import Parser from "ua-parser-js";

let sources = [];
let reload = 0;
let afterData;
const randomSubreddit = c => shuffleArray(dataHandler(c));

const initialFetchSubreddit = async (req, params, retries = 0) => {
  const userAgent = req && Parser(req.headers["user-agent"]);
  const isMobile = userAgent && userAgent.device.type === "mobile";
  const isNsfw = dataHandler("nsfw").includes(params);
  const fetchedData = await fetch(
    `https://www.reddit.com/r/${params}.json?limit=100`
  )
    .then(response => response.json())
    .then(async jsonData => {
      const { data } = jsonData;
      if (!data && retries < 3) {
        params = randomSubreddit(isNsfw ? "nsfw" : "sfw");
        const returnAgain = initialFetchSubreddit(req, params, retries + 1);
        return returnAgain;
      }
      afterData = data.after;
      const dataWithHtml = dataMapper(data.children, isMobile, isNsfw);
      if (!dataWithHtml.length && retries < 3) {
        params = randomSubreddit(isNsfw ? "nsfw" : "sfw");
        const returnAgain = initialFetchSubreddit(req, params, retries + 1);
        return returnAgain;
      }
      return { preloadedData: dataWithHtml, params, afterThis: data.after };
    })
    .catch(error => console.log("ERROR", error));
  return fetchedData;
};

class Scroller extends Component {
  static async getInitialProps({ req, query }) {
    const { subreddit } = query;
    const fetchedData = await initialFetchSubreddit(req, subreddit);
    return fetchedData;
  }

  handleSubredditChange = value => {
    const href = `/r/${value}`;
    const as = href;
    Router.push(href, as, { shallow: true });
  };
  componentDidMount() {
    if (this.props.params !== window.location.pathname.split("/r/")[1]) {
      message.error(
        `Could not find subreddit ${window.location.pathname.split("/r/")[1]}`
      );
      this.handleSubredditChange(this.props.params);
    }
    window.location.pathname !== this.props.params;
    if (window.screen.availWidth < 800)
      this.props.changeContext({ mobile: true });
    this.props.firebase.auth.onAuthStateChanged(user => {
      if (user) {
        this.props.firebase.db
          .ref(`users/${user.uid}`)
          .on("value", snapshot => {
            const collections = _.get(snapshot.val(), "collections", {});
            this.props.changeContext({
              userCollections: snapshot.val() && collections,
              user
            });
          });
      } else {
        console.log("No user initialized");
      }
    });

    if (dataHandler("nsfw").includes(this.props.params)) {
      this.categorySet("nsfw");
    }
    if (this.props.params === "allsubreddits") {
      return this.changeCat("", "allsubreddits");
    }
    this.props.changeContext({
      nextSubreddit:
        this.props.context.category ||
        dataHandler("nsfw").includes(this.props.params)
          ? randomSubreddit("nsfw")
          : randomSubreddit("sfw")
    });
  }

  setSources = value => (sources = value);
  setNewListName = listName =>
    this.props.changeContext({ newListName: listName });
  toggleShowListInput = bool =>
    this.props.changeContext({ showListInput: bool });
  toggleAutoPlayVideo = bool => {
    this.props.changeContext({ autoPlayVideo: bool });
    this.closeDropDownAfterAWhile();
  };
  setActiveCollection = collection =>
    this.props.changeContext({ activeCollection: collection });
  toggleIsLoading = state => {
    this.props.changeContext({ isLoading: state });
  };
  toggleFullscreen = () =>
    !this.props.context.isSearchActivated &&
    this.props.changeContext({
      fullscreen: !this.props.context.fullscreen
    });
  toggleIsModalVisible = () =>
    this.props.changeContext({
      isModalVisible: !this.props.context.isModalVisible
    });
  toggleSearchButton = value =>
    this.props.changeContext({ isSearchActivated: value });
  categorySet = val => this.props.changeContext({ category: val });
  setAutoCompleteDataSource = value =>
    this.props.changeContext({ autoCompleteDataSource: value });
  toggleDropDown = value =>
    this.props.changeContext({ isDropDownShowing: value });
  closeDropDownAfterAWhile = () =>
    setTimeout(
      () =>
        this.props.changeContext({
          isDropDownShowing: false
        }),
      1000
    );
  toggleGifsOnly = async () => {
    this.props.changeContext({
      isOnlyGifsShowing: !this.props.context.isOnlyGifsShowing
    });
    this.props.changeContext({ nextSubreddit: "" });
    this.closeDropDownAfterAWhile();
    await this.getSubreddit(this.props.params);
  };
  togglePicsOnly = () => {
    this.props.changeContext({ nextSubreddit: "" });
    this.props.changeContext({
      isOnlyPicsShowing: !this.props.context.isOnlyPicsShowing
    });
    this.closeDropDownAfterAWhile();
    this.getSubreddit(this.props.params);
  };
  pushToHistory = route => {
    Router.push(route);
  };

  switchCat = _.throttle(async () => {
    this.toggleIsLoading(true);
    if (!this.props.context.nextSubreddit) {
      await this.props.changeContext({
        nextSubreddit:
          this.props.context.category ||
          dataHandler("nsfw").includes(this.props.params)
            ? randomSubreddit("nsfw")
            : randomSubreddit("sfw")
      });
    }
    window.stop();
    Router.push(`/r/${this.props.context.nextSubreddit}`);
  }, 250);

  goBackinHistory =
    !this.props.context.isLoading && _.throttle(() => Router.back(), 250);

  handleKeyDown = e => {
    if (e.key === "ArrowLeft") {
      this.goBackinHistory();
    }
    if (e.key === "Escape") {
      this.props.changeContext({ fullscreen: false });
    }
    if (e.key === "a") {
      this.goBackinHistory();
    }

    if (e.key === "ArrowRight") {
      this.switchCat();
    }
    if (e.key === "d") {
      this.switchCat();
    }
  };

  onSwiped = ({ absX, velocity, dir }) => {
    if (velocity < 0.5 && absX < 30) return;
    switch (dir) {
      case "Right":
        this.goBackinHistory();
        return;
      case "Left":
        this.switchCat();
        return;

      default:
        return;
    }
  };

  changeCat = (e, cat) => {
    this.categorySet(cat);
    this.getSubreddit(shuffleArray(dataHandler(cat)));
    message.info(
      `Category is ${cat}, press or swipe right to shuffle subreddit`
    );
    this.props.changeContext({
      isDropDownShowing: false
    });
  };

  addMediaToCollection = (fields, collection) => {
    this.props.context.user
      ? this.props.firebase.updateDataToCollection({ ...fields }, collection)
      : this.toggleIsModalVisible();
  };

  render() {
    const {
      isModalVisible,
      isSearchActivated,
      isDropDownShowing,
      autoCompleteDataSource,
      fullscreen,
      isLoading,
      subreddit,
      isOnlyGifsShowing,
      isOnlyPicsShowing,
      mobile,
      isLoadingMore,
      showListInput,
      userCollections,
      activeCollection,
      category,
      user,
      autoPlayVideo
    } = this.props.context;
    const { firebase, preloadedData } = this.props;
    const mediaTitlesArr = preloadedData
      ? preloadedData.map(items => items.title)
      : [];
    const mediaTitles = mediaTitlesArr.join(", ");
    if (
      sources !== undefined &&
      preloadedData !== undefined &&
      sources.length < preloadedData.length
    )
      sources = preloadedData;
    return (
      <div
        onKeyDown={
          !isModalVisible && !showListInput && !isSearchActivated
            ? this.handleKeyDown
            : undefined
        }
      >
        <Swipeable className={`wrapper`} onSwiped={this.onSwiped}>
          <Head>
            <title>r/{this.props.params}</title>
            <meta
              name="description"
              content={`Browse 100+ images and gifs from r/${this.props.params} subreddit. Sliddit is a gallery from the most popular subreddits.`}
            />
            <meta name="keywords" content={mediaTitles} />
          </Head>
          <div className="topbarZen">
            <LoginModal
              firebase={firebase}
              toggleIsModalVisible={this.toggleIsModalVisible}
              isModalVisible={this.props.context.isModalVisible}
            />
            <SearchComponent
              setAutoCompleteDataSource={this.setAutoCompleteDataSource}
              pushToHistory={this.pushToHistory}
              dataHandler={dataHandler}
              isSearchActivated={isSearchActivated}
              autoCompleteDataSource={autoCompleteDataSource}
              toggleSearchButton={this.toggleSearchButton}
            />
            <GoBackButton goBackFunc={this.goBackinHistory} />
            <MainDropDownMenu
              toggleIsLoading={this.toggleIsLoading}
              isLoading={this.props.context.isLoading}
              autoPlayVideo={autoPlayVideo}
              toggleAutoPlayVideo={this.toggleAutoPlayVideo}
              isDropDownShowing={isDropDownShowing}
              setSources={this.setSources}
              isOnlyGifsShowing={isOnlyGifsShowing}
              isOnlyPicsShowing={isOnlyPicsShowing}
              category={category}
              showListInput={showListInput}
              userCollections={userCollections}
              activeCollection={activeCollection}
              user={user}
              toggleDropDown={this.toggleDropDown}
              toggleIsModalVisible={this.toggleIsModalVisible}
              setActiveCollection={this.setActiveCollection}
              toggleGifsOnly={this.toggleGifsOnly}
              togglePicsOnly={this.togglePicsOnly}
              changeCat={this.changeCat}
              toggleShowListInput={this.toggleShowListInput}
              firebase={firebase}
              pushToHistory={this.pushToHistory}
            />
          </div>
          <div
            onClick={() => this.toggleDropDown(false)}
            className={`contentZen ${fullscreen && "fullscreen"}`}
          >
            {reload > 6 && (
              <div
                onClick={() =>
                  this.getSubreddit(
                    shuffleArray(dataHandler(this.props.context.category))
                  )
                }
                className="internetProblemReload"
              >
                <Icon
                  style={{ color: "white", fontSize: 30 }}
                  type="disconnect"
                />
                <p>Press to reload</p>
              </div>
            )}
            <SwitchCategoryButtons
              isSearchActivated={isSearchActivated}
              showListInput={showListInput}
              isModalVisible={isModalVisible}
              toggleIsLoading={this.toggleIsLoading}
              nextColl={this.props.context.nextSubreddit}
            />
            <React.Fragment>
              {sources && sources.length ? (
                <AddMarkup
                  nextSubreddit={
                    this.props.context.nextSubreddit ||
                    this.props.context.subreddit
                  }
                  context={this.props.context}
                  changeContext={this.props.changeContext}
                  activeCollection={this.props.context.activeCollection}
                  collections={userCollections}
                  addMediaToCollection={this.addMediaToCollection}
                  isSearchActivated={isSearchActivated}
                  toggleFullscreen={this.toggleFullscreen}
                  toggleIsLoading={this.toggleIsLoading}
                  mobile={mobile}
                  isOnlyGifsShowing={isOnlyGifsShowing}
                  isOnlyPicsShowing={isOnlyPicsShowing}
                  fullscreen={fullscreen}
                  dataSource={sources}
                  loadMore={this.moreSubreddits}
                  isLoading={isLoading}
                  isLoadingMore={isLoadingMore}
                />
              ) : (
                <Empty
                  style={{ marginTop: "35vh" }}
                  image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
                  imageStyle={{
                    height: 60
                  }}
                  description={
                    <span>
                      "Sorry! Subreddit not available. Press to load a new
                      subreddit!"
                    </span>
                  }
                >
                  <Button onClick={this.switchCat} type="primary">
                    Load another subreddit
                  </Button>
                </Empty>
              )}

              <div
                style={{ opacity: isSearchActivated ? 0.1 : 1 }}
                className="subredditNameDiv"
              >
                <h2 className="subredditName">
                  {activeCollection && activeCollection.length
                    ? activeCollection
                    : subreddit || this.props.params}{" "}
                  <Icon type="tag-o" />
                </h2>
              </div>
            </React.Fragment>
          </div>
        </Swipeable>
      </div>
    );
  }

  getSubreddit = async (subreddit, notShowLoad) => {
    await this.props.changeContext({
      subreddit: subreddit,
      isLoading: !notShowLoad
    });
    sources = [];
    await fetch(`https://www.reddit.com/r/${subreddit}.json?limit=100`)
      .then(response => response.json())
      .then(async jsonData => {
        reload = 0;
        afterData = jsonData.data.after;
        sources = dataMapper(jsonData.data.children, this.props.context.mobile);
        // if (sources.length) {
        //   this.pushToHistory(`/r/${this.props.context.subreddit}`);
        // }
        this.props.changeContext({ isLoading: false });
      })

      .catch(async error => {
        console.log({ error });
        reload = reload + 1;
        if (reload < 10 && !sources.length) {
          const newSubreddit = shuffleArray(
            dataHandler(this.props.context.category)
          );
          this.props.changeContext({ nextSubreddit: newSubreddit });
          await this.getSubreddit(newSubreddit);
          this.props.changeContext({ isLoading: false });
        } else {
          alert(
            "Could not load data, check your internet connection. Firefox incognito mode may be causing this issue."
          );
        }
      });
    // if (reload < 10) {
    //   if (!sources.length) {
    //     await this.getSubreddit(shuffleArray(dataHandler(this.props.context.category)));
    //   } else {
    //     this.props.changeContext({ isLoading: false });
    //   }
    // }
    this.props.changeContext({ isLoading: false });
  };

  moreSubreddits = async () => {
    this.props.changeContext({ isLoadingMore: true });
    const apiUrl = `https://www.reddit.com/r/${this.props.params}.json?after=${
      afterData || this.props.afterThis
    }&limit=100`;
    console.log(`Fetching: ${apiUrl}`);
    const isNsfw = dataHandler("nsfw").includes(this.props.params);
    await fetch(apiUrl)
      .then(response => response.json())
      .then(jsonData => {
        afterData = jsonData.data.after;
        let convertedAfterData = dataMapper(
          jsonData.data.children,
          this.props.context.mobile,
          isNsfw
        );
        // const haveVideoOrGif = afterData.length && afterData.some(media => media.gif || media.video);
        if (!convertedAfterData.length) {
          message.info(`Can't get more media.`);
        }
        sources = sources.concat(convertedAfterData);
        this.forceUpdate();
      })
      .catch(error => {
        message.info(`Can't get more media.`);
        console.log({ error });
      });
    this.forceUpdate();
    this.props.changeContext({ isLoadingMore: false });
  };
}

export default withRouter(Scroller);
