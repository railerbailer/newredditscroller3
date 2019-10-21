import Router, { withRouter } from "next/router";
import React, { Component } from "react";
import { Swipeable } from "react-swipeable";
import "antd/dist/antd.css";
import "../../App.css";
import _ from "lodash";
import AddMarkup from "../../components/addMarkup";
import { Icon, message, Spin } from "antd";
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
class Scroller extends Component {
  // static async getInitialProps({ Component, router, ctx }) {
  //   let pageProps = {};

  //   if (Component.getInitialProps) {
  //     pageProps = await Component.getInitialProps(ctx);
  //   }

  //   return { pageProps };
  // }

  static async getInitialProps({ req, query }) {
    const { subreddit } = query;
    const userAgent = req && Parser(req.headers["user-agent"]);
    const isMobile = userAgent && userAgent.device.type === "mobile";
    const preloadedData = await fetch(
      `https://www.reddit.com/r/${subreddit}.json?limit=100`
    )
      .then(response => response.json())
      .then(async jsonData => {
        return jsonData.data && dataMapper(jsonData.data.children, isMobile);
      })
      .catch(error => console.log("ERROR", error));

    return { params: subreddit, preloadedData };
  }

  state = {
    mobile: false,
    isLoadingMore: false,
    fullscreenActive: false,
    autoPlayVideo: true,
    isDropDownShowing: false,
    isLoading: false,
    isOnlyGifsShowing: false,
    isOnlyPicsShowing: false,
    isSearchActivated: false,
    autoCompleteDataSource: [],
    subreddit: "",
    after: "",
    category: "",
    isModalVisible: false,
    showListInput: false,
    newListName: "",
    userCollections: { "Register to use": "kek" },
    user: null,
    activeCollection: "",
    firstLoad: true
  };

  componentDidMount() {
    this.setState({ firstLoad: false });
    if (window.screen.availWidth < 800) this.setState({ mobile: true });
    this.props.firebase.auth.onAuthStateChanged(user => {
      if (user) {
        this.props.firebase.db
          .ref(`users/${user.uid}`)
          .on("value", snapshot => {
            const collections = _.get(snapshot.val(), "collections", {});
            snapshot.val() &&
              this.setState({ userCollections: collections, user });
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
  setNewListName = listName => this.setState({ newListName: listName });
  toggleShowListInput = bool => this.setState({ showListInput: bool });
  toggleAutoPlayVideo = bool => this.setState({ autoPlayVideo: bool });
  setActiveCollection = collection =>
    this.setState({ activeCollection: collection });
  toggleIsLoading = state => this.setState({ isLoading: state });
  toggleFullscreen = () =>
    !this.state.isSearchActivated &&
    this.setState({ fullscreenActive: !this.state.fullscreenActive });
  toggleIsModalVisible = () =>
    this.setState({ isModalVisible: !this.state.isModalVisible });
  toggleSearchButton = value => this.setState({ isSearchActivated: value });
  categorySet = val => this.setState({ category: val });
  setAutoCompleteDataSource = value =>
    this.setState({ autoCompleteDataSource: value });
  toggleDropDown = value => this.setState({ isDropDownShowing: value });
  closeDropDownAfterAWhile = () =>
    setTimeout(
      () =>
        this.setState({
          isDropDownShowing: false
        }),
      1500
    );
  toggleGifsOnly = async () => {
    this.setState({
      isOnlyGifsShowing: !this.state.isOnlyGifsShowing
    });
    closeDropDownAfterAWhile();
    await this.getSubreddit(this.state.subreddit);
  };
  togglePicsOnly = () => {
    this.setState({
      isOnlyPicsShowing: !this.state.isOnlyPicsShowing
    });
    closeDropDownAfterAWhile();
    this.getSubreddit(this.state.subreddit);
  };
  pushToHistory = route => {
    Router.push(route);
  };

  switchCat = _.throttle(async () => {
    this.toggleIsLoading(true);
    window.stop();
    this.toggleDropDown(false);
    this.setActiveCollection("");
    this.setSources([]);
    !this.state.isLoading &&
      (await this.getSubreddit(shuffleArray(dataHandler(this.state.category))));

    this.toggleIsLoading(false);
  }, 250);
  goBackinHistory = _.throttle(() => Router.back(), 250);
  handleKeyDown = e => {
    if (e.key === "ArrowLeft") {
      this.goBackinHistory();
    }
    if (e.key === "Escape") {
      this.setState({ fullscreenActive: false });
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

  swipedLeft = (e, absX, isFlick) => {
    if (isFlick || absX > 30) {
      this.switchCat();
    }
  };

  swipedRight = (e, absX, isFlick) => {
    if (isFlick || absX > 30) {
      this.goBackinHistory();
    }
  };

  changeCat = (e, cat) => {
    this.categorySet(cat);
    this.getSubreddit(shuffleArray(dataHandler(cat)));
    message.info(
      `Category is ${cat}, press or swipe right to shuffle subreddit`
    );
    this.setState({ isDropDownShowing: false });
  };

  addMediaToCollection = (fields, collection) => {
    this.state.user
      ? this.props.firebase.updateDataToCollection({ ...fields }, collection)
      : this.toggleIsModalVisible();
  };

  render() {
    const {
      isModalVisible,
      isSearchActivated,
      isDropDownShowing,
      autoCompleteDataSource,
      fullscreenActive,
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
      autoPlayVideo,
      user,
      firstLoad
    } = this.state;
    const { firebase } = this.props;
    const mappedData = firstLoad ? this.props.preloadedData : sources;
    const mediaTitlesArr = mappedData.map(items => items.title);
    const mediaTitles = mediaTitlesArr.join(", ");
    return (
      <Swipeable
        className={`wrapper`}
        onKeyDown={
          !isModalVisible && !showListInput && !isSearchActivated
            ? this.handleKeyDown
            : undefined
        }
        onSwipedLeft={this.swipedLeft}
        onSwipedRight={this.swipedRight}
      >
        <Head>
          <title>{this.state.subreddit}</title>
          <meta
            name="description"
            content={`Showing images and gifs from subreddit ${this.props.params}`}
          />
          <meta name="keywords" content={mediaTitles} />
        </Head>
        <div className="topbarZen">
          <LoginModal
            firebase={firebase}
            toggleIsModalVisible={this.toggleIsModalVisible}
            isModalVisible={this.state.isModalVisible}
          />
          <SearchComponent
            setAutoCompleteDataSource={this.setAutoCompleteDataSource}
            getSubreddit={this.getSubreddit}
            dataHandler={dataHandler}
            isSearchActivated={isSearchActivated}
            autoCompleteDataSource={autoCompleteDataSource}
            toggleSearchButton={this.toggleSearchButton}
          />
          <GoBackButton goBackFunc={this.goBackinHistory} />
          <MainDropDownMenu
            isLoadingFetch={this.state.isLoading}
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
          className={`contentZen ${fullscreenActive && "fullscreen"}`}
        >
          {reload > 6 && (
            <div
              onClick={() =>
                this.getSubreddit(
                  shuffleArray(dataHandler(this.state.category))
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
            switchCat={this.switchCat}
          />
          <React.Fragment>
            {this.props.preloadedData || sources.length ? (
              <AddMarkup
                autoPlayVideo={autoPlayVideo}
                toggleIsModalVisible={this.toggleIsModalVisible}
                activeCollection={this.state.activeCollection}
                collections={userCollections}
                addMediaToCollection={this.addMediaToCollection}
                isSearchActivated={isSearchActivated}
                toggleFullscreen={this.toggleFullscreen}
                toggleIsLoading={this.toggleIsLoading}
                mobile={mobile}
                isOnlyGifsShowing={isOnlyGifsShowing}
                isOnlyPicsShowing={isOnlyPicsShowing}
                fullscreen={fullscreenActive}
                dataSource={mappedData}
                loadMore={this.moreSubreddits}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
              />
            ) : (
              <div className="iconSpinner">
                <Spin size="large" />
              </div>
            )}

            <div
              style={{ opacity: isSearchActivated ? 0.1 : 1 }}
              className="subredditNameDiv"
            >
              <h2 className="subredditName">
                {activeCollection.length ? activeCollection : subreddit}{" "}
                <Icon type="tag-o" />
              </h2>
            </div>
          </React.Fragment>
          )}
        </div>
      </Swipeable>
    );
  }

  getSubreddit = async (subreddit, notShowLoad) => {
    await this.setState({ subreddit: subreddit, isLoading: !notShowLoad });
    sources = [];
    await fetch(
      `https://www.reddit.com/r/${this.state.subreddit}.json?limit=100`
    )
      .then(response => response.json())
      .then(async jsonData => {
        reload = 0;
        this.setState({
          after: jsonData.data.after
        });
        sources = dataMapper(jsonData.data.children, this.state.mobile);
        // if (sources.length) {
        //   this.pushToHistory(`/subreddits/${this.state.subreddit}`);
        // }
        // const haveVideoOrGif = sources.length && sources.some(media => media.gif || media.video);
      })

      .catch(async () => {
        reload = reload + 1;
        if (reload < 10 && !sources.length)
          await this.getSubreddit(
            shuffleArray(dataHandler(this.state.category))
          );
        else {
          alert(
            "Could not load data, check your internet connection. Firefox incognito mode may be causing this issue."
          );
        }
      });
    // if (reload < 10) {
    //   if (!sources.length) {
    //     await this.getSubreddit(shuffleArray(dataHandler(this.state.category)));
    //   } else {
    //     this.setState({ isLoading: false });
    //   }
    // }
    this.setState({ isLoading: false });
  };

  moreSubreddits = async () => {
    this.setState({ isLoadingMore: true });
    await fetch(
      `https://www.reddit.com/r/${this.state.subreddit}.json?after=${this.state.after}&limit=100`
    )
      .then(response => response.json())
      .then(async jsonData => {
        this.setState({
          after: jsonData.data.after
        });
        let afterData = dataMapper(jsonData.data.children, this.state.mobile);
        // const haveVideoOrGif = afterData.length && afterData.some(media => media.gif || media.video);
        sources = sources.concat(afterData);
      })
      .catch(error => {
        message.info(`Can't get more media.`);
      });
    this.setState({ isLoadingMore: false });
  };
}

export default withRouter(Scroller);
