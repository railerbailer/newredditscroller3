import React, { Component } from "react";
import { Swipeable } from "react-swipeable";
import "../App.css";
import _ from "lodash";
import { message } from "antd";
import "../App.css";
import { dataHandler, shuffleArray } from "../public/utils/atomic";
import { carPath } from "../public/utils/carPath";
import LoginModal from "../components/loginModal";
import SearchComponent from "../components/search";
import MainDropDownMenu from "../components/mainDropDownMenu";
import CardComponent from "../components/cardComponent";
import GoBackButton from "../components/goBackButton";
import Router from "next/router";

class UserCollectionCards extends Component {
  state = {
    collection: "",
    showListInput: false,
    activeCollection: "",
    publicCollections: [],
    collectionsToRemake: []
  };

  componentDidMount() {
    if (window.screen.availWidth < 800)
      this.props.changeContext({ mobile: true });
    this.props.firebase.auth.onAuthStateChanged(user => {
      this.props.firebase.db.ref("users").on("value", snapshot => {
        let collectionsArray = [];
        const snapshotValues = snapshot.val();
        Object.entries(snapshotValues).forEach(([id, userCollections]) =>
          Object.values(userCollections).forEach(userCollectionsDeep => {
            userCollectionsDeep.Favorites !== "set at creation" &&
              Object.entries(userCollectionsDeep).forEach(
                ([name, userCollection]) =>
                  collectionsArray.push({
                    title: name + id,
                    data: userCollection
                  })
              );
          })
        );
        console.log({ collectionsArray });
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

    this.getCollection(this.props.params);
  }
  getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };
  getCollection = collection => {
    this.toggleIsLoading(true);
    this.setActiveCollection(collection);
    const { userCollections } = this.props.context;
    if (userCollections[collection]) {
      this.toggleIsLoading(false);
      return;
    }

    this.toggleIsLoading(false);
    return;
  };
  toggleAutoPlayVideo = bool =>
    this.props.changeContext({ autoPlayVideo: bool });
  toggleShowListInput = bool => this.setState({ showListInput: bool });
  setActiveCollection = collection =>
    this.props.changeContext({ activeCollection: collection });
  toggleIsLoading = state => this.props.changeContext({ isLoading: state });
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

  switchCat = _.throttle(async () => {
    window.stop();
    this.toggleDropDown(false);
    this.setActiveCollection("");
    await this.getCollection(shuffleArray(this.state.publicCollections));
  }, 500);

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
  goBackinHistory = _.throttle(() => Router.back(), 500);
  render() {
    const { collection, showListInput, publicCollections } = this.state;
    const {
      category,
      autoCompleteDataSource,
      isDropDownShowing,
      isSearchActivated,
      userCollections,
      isOnlyGifsShowing,
      isOnlyPicsShowing,
      activeCollection,
      autoPlayVideo,
      fullscreen,
      user
    } = this.props.context;
    const { firebase } = this.props;
    const data =
      publicCollections &&
      publicCollections.map((collection, i) => {
        const {
          data = null,
          title = "User collection" + this.getRandomInt(1000),
          description = ""
          // madeBy = "",
          // accepted = true
        } = collection;
        console.log(title);
        return (
          <CardComponent
            key={title + i}
            title={title}
            description={description}
            madeBy={"Anonymous"}
            data={data}
            pushToHistory={this.pushToHistory}
          />
        );
      });
    return (
      <Swipeable className={`wrapper`}>
        <div className="topbarZen">
          <LoginModal
            firebase={firebase}
            toggleIsModalVisible={this.toggleIsModalVisible}
            isModalVisible={this.props.context.isModalVisible}
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
            autoPlayVideo={autoPlayVideo}
            toggleAutoPlayVideo={this.toggleAutoPlayVideo}
            setSources={() => {}}
            collectionsMode={true}
            isDropDownShowing={isDropDownShowing}
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
          className={`userCollectionContent ${fullscreen && "fullscreen"}`}
        >
          {!data.length ? (
            <div className="spinner">
              <div className="centered-text">
                <div className="centered-text">
                  Loading <strong>public user banks</strong>
                </div>
              </div>
              <div className="carSpinner">
                <svg xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFF" d={carPath} />
                </svg>
              </div>
              <br />
              <br />
            </div>
          ) : (
            <div className="cardGrid">{data}</div>
          )}
        </div>
        <React.Fragment>
          <div
            style={{ opacity: isSearchActivated ? 0.1 : 1 }}
            className="subredditNameDiv"
          >
            <h2 className="subredditName">
              User banks
              {/* {activeCollection.length ? activeCollection : collection} <Icon type="tag-o" /> */}
            </h2>
          </div>
        </React.Fragment>
      </Swipeable>
    );
  }
}

export default UserCollectionCards;
