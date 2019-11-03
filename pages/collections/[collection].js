import React, { Component } from "react";
import { Swipeable } from "react-swipeable";
import "../../App.css";
import "antd/dist/antd.css";
import _ from "lodash";
import AddMarkup from "../../components/addMarkup";
import { Icon, message, Spin } from "antd";
import { dataHandler, shuffleArray } from "../../public/utils/atomic";
import LoginModal from "../../components/loginModal";
import SearchComponent from "../../components/search";
import SwitchCategoryButtons from "../../components/switchCategoryButtons";
import MainDropDownMenu from "../../components/mainDropDownMenu";
import GoBackButton from "../../components/goBackButton";
import Router from "next/router";
import Parser from "ua-parser-js";

let sources = [];
let reload = 0;
class CollectionsScroller extends Component {
  static async getInitialProps({ req, query }) {
    const { collection } = query;
    const userAgent = req && Parser(req.headers["user-agent"]);
    const isMobile = userAgent && userAgent.device.type === "mobile";
    return { params: collection, isMobile };
  }
  state = {
    collection: "",
    publicCollections: [],
    sources: [],
    nextCollection: ""
  };
  componentDidUpdate(prevProps, prevState) {
    if (
      !this.props.context.isLoading &&
      prevProps.params !== this.props.params
    ) {
      this.getCollection(this.props.params);
    }
  }
  componentDidMount() {
    window.screen.availWidth < 800
      ? this.props.changeContext({ mobile: true })
      : this.props.changeContext({ mobile: this.props.isMobile });
    window.scrollTo(0, 0);
    this.props.firebase.auth.onAuthStateChanged(user => {
      this.props.firebase.db.ref("users").on("value", snapshot => {
        let collectionsArray = [];
        const snapshotValues = snapshot.val();
        Object.entries(snapshotValues).forEach(([id, userCollections]) =>
          Object.values(userCollections).forEach(userCollectionsDeep =>
            Object.entries(userCollectionsDeep).forEach(
              ([name, userCollection]) =>
                collectionsArray.push({
                  title: name + id,
                  data: userCollection
                })
            )
          )
        );
        this.setState({
          publicCollections: collectionsArray
        });
      });
      if (user) {
        this.props.changeContext({ user: user });
        this.props.firebase.db
          .ref(`users/${user.uid}`)
          .on("value", snapshot => {
            const collections = _.get(snapshot.val(), "collections", {});
            this.props.changeContext({ userCollections: collections });
          });
      } else {
        this.props.changeContext({ user: null });
      }
    });
    setTimeout(() => this.getCollection(this.props.params), 2500);
  }
  getCollection = collection => {
    this.setState({ nextCollection: this.nextCollection() });
    this.toggleIsLoading(true);
    this.setActiveCollection(collection);
    const { publicCollections } = this.state;
    const { userCollections } = this.props.context;
    if (userCollections[collection]) {
      this.setSources(Object.values(userCollections[collection]));
    } else {
      publicCollections.forEach(item => {
        if (item.title === collection) {
          return this.setSources(Object.values(item.data));
        }
      });
    }
    this.toggleIsLoading(false);
    return;
  };
  setSources = value => this.setState({ sources: value });
  setNewListName = listName =>
    this.props.changeContext({ newListName: listName });
  toggleShowListInput = bool =>
    this.props.changeContext({ showListInput: bool });
  setActiveCollection = collection =>
    this.props.changeContext({ activeCollection: collection });
  toggleIsLoading = state => this.props.changeContext({ isLoading: state });
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
  toggleAutoPlayVideo = bool =>
    this.props.changeContext({ autoPlayVideo: bool });
  toggleDropDown = value =>
    this.props.changeContext({ isDropDownShowing: value });
  toggleGifsOnly = async () => {
    this.props.changeContext({
      isOnlyGifsShowing: !this.props.context.isOnlyGifsShowing
    });
    setTimeout(
      () =>
        this.props.changeContext({
          isDropDownShowing: false
        }),
      1500
    );
    await this.getCollection(this.state.collection);
  };
  togglePicsOnly = () => {
    this.props.changeContext({
      isOnlyPicsShowing: !this.props.context.isOnlyPicsShowing
    });
    setTimeout(
      () =>
        this.props.changeContext({
          isDropDownShowing: false
        }),
      1500
    );
    this.getCollection(this.state.collection);
  };
  pushToHistory = route => {
    Router.push(route);
  };

  switchCat = _.throttle(() => {
    window.stop();
    this.toggleDropDown(false);
    const nextCollectionParam = this.nextCollection();
    nextCollectionParam &&
      this.pushToHistory(`/collections/${this.nextCollection()}`);
  }, 250);

  nextCollection = () => {
    const collectionsWithContent = this.state.publicCollections.filter(
      c => Object.values(c.data).length > 0
    );
    const collectionsTitles = collectionsWithContent.map(c => c.title);
    const shuffledCollection = shuffleArray(collectionsTitles);
    return shuffledCollection;
  };

  goBackinHistory = _.throttle(() => Router.back(), 250);
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
    this.getCollection(shuffleArray(this.state.publicCollections));
    message.info(
      `Category is ${cat}, press or swipe right to shuffle collection`
    );
    this.props.changeContext({ isDropDownShowing: false });
  };
  addMediaToCollection = (fields, collection) => {
    this.props.context.user
      ? this.props.firebase.updateDataToCollection({ ...fields }, collection)
      : this.toggleIsModalVisible();
  };

  render() {
    const { collection, publicCollections } = this.state;
    const {
      isModalVisible,
      isSearchActivated,
      isDropDownShowing,
      autoCompleteDataSource,
      fullscreen,
      isLoading,
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
    const { firebase } = this.props;
    return (
      <div
        onKeyDown={
          !isModalVisible &&
          !isModalVisible &&
          !showListInput &&
          !isSearchActivated
            ? this.handleKeyDown
            : undefined
        }
      >
        <Swipeable className={`wrapper`} onSwiped={this.onSwiped}>
          <div className="topbarZen">
            <LoginModal
              firebase={firebase}
              toggleIsModalVisible={this.toggleIsModalVisible}
              isModalVisible={isModalVisible}
            />
            <SearchComponent
              collectionMode={true}
              publicCollections={publicCollections.map(item => item.title)}
              setAutoCompleteDataSource={this.setAutoCompleteDataSource}
              getSubreddit={this.getCollection}
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
              collectionsMode={true}
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
            />
          </div>
          <div className={`contentZen ${fullscreen && "fullscreen"}`}>
            {reload > 6 && (
              <div
                onClick={() =>
                  this.getCollection(shuffleArray(userCollections.collection))
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
              collectionsMode={true}
              isSearchActivated={isSearchActivated}
              showListInput={showListInput}
              isModalVisible={isModalVisible}
              switchCat={this.switchCat}
              toggleIsLoading={this.toggleIsLoading}
              nextColl={this.state.nextCollection}
            />
            <React.Fragment>
              {this.state.sources && this.state.sources.length ? (
                <AddMarkup
                  collectionsMode={true}
                  toggleIsModalVisible={this.toggleIsModalVisible}
                  activeCollection={activeCollection}
                  collections={userCollections}
                  addMediaToCollection={this.addMediaToCollection}
                  isSearchActivated={isSearchActivated}
                  toggleFullscreen={this.toggleFullscreen}
                  toggleIsLoading={this.toggleIsLoading}
                  mobile={mobile}
                  isOnlyGifsShowing={isOnlyGifsShowing}
                  isOnlyPicsShowing={isOnlyPicsShowing}
                  fullscreen={fullscreen}
                  dataSource={this.state.sources}
                  loadMore={this.moreSubreddits}
                  isLoading={isLoading}
                  isLoadingMore={isLoadingMore}
                />
              ) : (
                <div className="iconSpinner">
                  <Spin size="large" />
                  <br />
                  Loading media...
                </div>
              )}
              <div
                style={{ opacity: isSearchActivated ? 0.1 : 1 }}
                className="subredditNameDiv"
              >
                <h2 className="subredditName">
                  {activeCollection && activeCollection.length
                    ? activeCollection
                    : collection}{" "}
                  <Icon type="tag-o" />
                </h2>
              </div>
            </React.Fragment>
          </div>
        </Swipeable>
      </div>
    );
  }
}

export default CollectionsScroller;
