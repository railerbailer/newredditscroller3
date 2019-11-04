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
class Scroller extends Component {
  static async getInitialProps({ req, query }) {
    const { subreddit } = query;
    const userAgent = req && Parser(req.headers["user-agent"]);
    const isMobile = userAgent && userAgent.device.type === "mobile";
    const preloadedData = await fetch(
      `https://www.reddit.com/r/${subreddit}.json?limit=100`
    )
      .then(response => response.json())
      .then(async jsonData => {
        afterData = jsonData.data.after;
        return jsonData.data && dataMapper(jsonData.data.children, isMobile);
      })
      .catch(error => console.log("ERROR", error));

    return { params: subreddit, preloadedData };
  }

  componentDidMount() {
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
  }

  setSources = value => (sources = value);
  setNewListName = listName =>
    this.props.changeContext({ newListName: listName });
  toggleShowListInput = bool =>
    this.props.changeContext({ showListInput: bool });
  toggleAutoPlayVideo = bool =>
    this.props.changeContext({ autoPlayVideo: bool });
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
      1500
    );
  toggleGifsOnly = async () => {
    this.props.changeContext({
      isOnlyGifsShowing: !this.props.context.isOnlyGifsShowing
    });
    this.closeDropDownAfterAWhile();
    await this.getSubreddit(this.props.context.subreddit);
  };
  togglePicsOnly = () => {
    this.props.changeContext({
      isOnlyPicsShowing: !this.props.context.isOnlyPicsShowing
    });
    this.closeDropDownAfterAWhile();
    this.getSubreddit(this.props.context.subreddit);
  };
  pushToHistory = route => {
    Router.push(route);
  };

  switchCat = _.throttle(() => {
    this.toggleIsLoading(true);
    const { category } = this.props.context;
    window.stop();
    Router.push(`/subreddits/${randomSubreddit(category)}`);
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
      console.log("D");
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
            <title>{this.props.params}</title>
            <meta
              name="description"
              content={`Images and gifs from r/${this.props.params}`}
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
              nextColl={shuffleArray(dataHandler(this.props.context.category))}
            />
            <React.Fragment>
              {sources && sources.length ? (
                <AddMarkup
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
    await fetch(
      `https://www.reddit.com/r/${this.props.context.subreddit}.json?limit=100`
    )
      .then(response => response.json())
      .then(async jsonData => {
        reload = 0;
        afterData = jsonData.data.after;
        sources = dataMapper(jsonData.data.children, this.props.context.mobile);
        // if (sources.length) {
        //   this.pushToHistory(`/subreddits/${this.props.context.subreddit}`);
        // }
        // const haveVideoOrGif = sources.length && sources.some(media => media.gif || media.video);
      })

      .catch(async () => {
        reload = reload + 1;
        if (reload < 10 && !sources.length)
          await this.getSubreddit(
            shuffleArray(dataHandler(this.props.context.category))
          );
        else {
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
    await fetch(
      `https://www.reddit.com/r/${this.props.params}.json?after=${afterData}&limit=100`
    )
      .then(response => response.json())
      .then(jsonData => {
        afterData = jsonData.data.after;
        let convertedAfterData = dataMapper(
          jsonData.data.children,
          this.props.context.mobile
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
