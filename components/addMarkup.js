import React, { Component } from "react";
import { Icon, Button, Spin, Tooltip } from "antd";
import LazyLoad from "react-lazyload";
import Image from "./image";
import Video from "./video";
import { throttle } from "lodash";
import { Swipeable } from "react-swipeable";
import { carPath } from "../public/utils/carPath";
let html = [];
class AddMarkup extends Component {
  state = {
    activeElement: 0,
    loadedData: 3
  };
  componentDidUpdate(prevProps) {
    const { activeElement } = this.state;
    if (this.props.fullscreen !== prevProps.fullscreen) {
      this[`gridElement${activeElement}`] &&
        this[`gridElement${activeElement}`].scrollIntoView({
          block: "center"
        });
    }
    if (this.props.dataSource !== prevProps.dataSource) {
      this.setState({ activeElement: 0 });
    }
  }

  loadMoreContent = async () => {
    await this.props.loadMore();
    this.renderHtml();
  };

  setActiveElement = value => {
    this.setState({ activeElement: value });
  };

  setLoadedData = value =>
    this.setState({ loadedData: this.state.loadedData + 1 });

  getElementIndex = (index, ref) => {
    this.setActiveElement(index);
    this.props.toggleFullscreen();
  };

  getPreviousElement = throttle(() => {
    const { activeElement } = this.state;
    if (!activeElement) return;
    this.setActiveElement(activeElement - 1);
  }, 100);
  getNextElement = throttle(async () => {
    const { activeElement } = this.state;
    const { isLoadingMore, loadMore, activeCollection } = this.props;
    const haveMoreContent = activeElement + 2 >= html.length;
    if (!activeCollection && haveMoreContent) {
      if (!isLoadingMore) {
        await loadMore();
      }
      this.setActiveElement(
        haveMoreContent ? activeElement + 1 : activeElement
      );

      return;
    }
    html &&
      html.length !== activeElement + 1 &&
      this.setActiveElement(activeElement + 1);
  }, 200);
  handleKeyDown = e => {
    if (this.props.isSearchActivated) return;
    switch (e.key) {
      case "s":
        this.getNextElement();
        break;
      case "ArrowDown":
        this.getNextElement();
        break;
      case "ArrowUp":
        this.getPreviousElement();
        break;
      case "w":
        this.getPreviousElement();
        break;
      case " ":
        this.videoPlayer && this.videoPlayer.play();
        break;
      default:
        break;
    }
  };

  onSwiped = ({ absX, velocity, dir }) => {
    if (!this.props.fullscreen || (velocity < 0.5 && absX < 30)) return;
    switch (dir) {
      case "Up":
        this.getNextElement();
        return;
      case "Down":
        this.getPreviousElement();
        return;

      default:
        return;
    }
  };

  getIdFromUrl = url => {
    let urlWithoutHttps = url.replace("https://", "").replace("http://", "");
    const indexOfFirstSlash = urlWithoutHttps.indexOf("/");
    const stringAfterFirstSlash = urlWithoutHttps.slice(
      indexOfFirstSlash + 1,
      urlWithoutHttps.length - 1
    );
    const indexOfSecondSlash = stringAfterFirstSlash.indexOf("/");
    const indexOfNextDot = stringAfterFirstSlash.indexOf(".");
    const chooseIndex =
      indexOfNextDot > 4
        ? indexOfNextDot
        : indexOfSecondSlash > 4
        ? indexOfSecondSlash
        : stringAfterFirstSlash.length - 1;
    const id = stringAfterFirstSlash.slice(1, chooseIndex);
    return id;
  };

  renderHtml = dataSource => {
    const {
      isOnlyPicsShowing,
      isOnlyGifsShowing,
      mobile,
      fullscreen,
      addMediaToCollection,
      collections,
      autoPlayVideo
    } = this.props;
    if (!dataSource) {
      dataSource = this.props.dataSource;
    }
    let filteredData = [];
    if (mobile) filteredData = dataSource.filter(item => !item.gif);
    if (!isOnlyGifsShowing && isOnlyPicsShowing)
      filteredData = dataSource.filter(item => item.image);
    else if (!isOnlyPicsShowing && isOnlyGifsShowing)
      filteredData = dataSource
        .filter(item => item.video)
        .filter(item => item.gif || item.video);
    else if (isOnlyPicsShowing && isOnlyGifsShowing) filteredData = dataSource;
    else filteredData = dataSource;
    html = filteredData
      .filter(item => Object.entries(item).length !== 0)
      .slice(0, this.state.loadedData)
      .map((data, i) => {
        const { gif, image, video, thumbnail, title, permalink } = data;
        const size = {
          superTall: 645,
          veryTall: 645,
          rectangular: 385,
          superWide: 255,
          veryWide: 255
        };
        if (image) {
          const source = mobile
            ? image.low || image.high || thumbnail
            : image.high || image.low || image.source || thumbnail;
          const imageId = this.getIdFromUrl(source);
          return (
            <div
              key={i}
              ref={el => (this[`gridElement${i}`] = el)}
              className={`gridElement pics ${image.className}`}
            >
              <LazyLoad
                unmountIfInvisible={true}
                height={size[image.className]}
                offset={1400}
                debounce={0}
                throttle={0}
                key={i}
              >
                <Image
                  affiliateLink={image.affiliateLink}
                  permalink={permalink}
                  title={title}
                  setLoadedData={this.setLoadedData}
                  loadedData={this.state.loadedData}
                  firebaseId={imageId}
                  toggleIsModalVisible={this.props.toggleIsModalVisible}
                  ratioClassName={image.className}
                  index={i}
                  toggleFullscreen={this.getElementIndex}
                  addMediaToCollection={addMediaToCollection}
                  collections={collections}
                  className="image"
                  key={`image${i}`}
                  fullscreen={fullscreen}
                  src={source}
                />
              </LazyLoad>
              <Tooltip placement="top" title={title}>
                <p className="titleText">{title}</p>
              </Tooltip>
            </div>
          );
        }
        if (video) {
          const videoId = this.getIdFromUrl(video.url);
          return (
            <div
              key={i}
              ref={el => (this[`gridElement${i}`] = el)}
              className={`gridElement gifs ${video.className}`}
            >
              <Video
                height={size[video.className]}
                activeElement={this.state.activeElement}
                autoPlayVideo={autoPlayVideo}
                permalink={permalink}
                title={title}
                setLoadedData={this.setLoadedData}
                loadedData={this.state.loadedData}
                firebaseId={videoId}
                toggleIsModalVisible={this.props.toggleIsModalVisible}
                className="video"
                ratioClassName={video.className}
                index={i}
                toggleFullscreen={this.getElementIndex}
                addMediaToCollection={addMediaToCollection}
                collections={collections}
                key={`video${i}`}
                mobile={mobile}
                src={video.url}
                fullscreen={fullscreen}
                poster={video.image || thumbnail}
              />

              <Tooltip placement="top" title={title}>
                <p className="titleText">{title}</p>
              </Tooltip>
            </div>
          );
        }
        if (gif && (!mobile || gif.affiliateLink)) {
          const gifId = this.getIdFromUrl(gif.url);
          return (
            <div
              key={i}
              ref={el => (this[`gridElement${i}`] = el)}
              className={`gridElement gifs ${gif.className}`}
            >
              <LazyLoad
                unmountIfInvisible={true}
                height={size[gif.className]}
                offset={1400}
                key={i}
                debounce={0}
                throttle={0}
              >
                <Image
                  affiliateLink={gif.affiliateLink}
                  permalink={permalink}
                  title={title}
                  setLoadedData={this.setLoadedData}
                  loadedData={this.state.loadedData}
                  firebaseId={gifId}
                  toggleIsModalVisible={this.props.toggleIsModalVisible}
                  ratioClassName={gif.className}
                  index={i}
                  toggleFullscreen={this.getElementIndex}
                  addMediaToCollection={this.props.addMediaToCollection}
                  collections={collections}
                  className={`gif`}
                  src={gif.url}
                />
              </LazyLoad>
              <Tooltip placement="top" title={title}>
                <p className="titleText">{title}</p>
              </Tooltip>
            </div>
          );
        }
        return null;
      });
  };
  render() {
    this.renderHtml(this.props.dataSource);
    const { activeElement } = this.state;
    const {
      fullscreen,
      isLoadingMore,
      collectionsMode,
      activeCollection,
      isLoading
    } = this.props;
    return (
      <div onKeyDown={e => this.handleKeyDown(e)}>
        <Swipeable
          onSwiped={this.onSwiped}
          style={{ backgroundColor: "rgb(20, 20, 20)" }}
        >
          {html.length &&
            (fullscreen ? (
              <div
                style={{
                  opacity: isLoading ? 0.1 : 1,
                  transition: "opacity 400ms"
                }}
                className="fullscreenScroll"
              >
                <Icon
                  type="close"
                  className="closeFullScreen"
                  onClick={() => this.getElementIndex(activeElement)}
                />

                <div
                  style={{ zIndex: isLoadingMore ? 10 : fullscreen ? 0 : 0 }}
                  className="loadingMoreSpinner"
                >
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FFF" d={carPath} />
                  </svg>
                </div>

                {html[activeElement]}
                {html[activeElement + 1] && html[activeElement + 1]}
                {/* {html[activeElement + 1]} */}
                {/* {(!mobile || activeElement > 2) && html[activeElement + 2]}
              {activeElement > 5 && html[activeElement + 3]}
              {(!mobile || activeElement > 9) && html[activeElement + 4]} */}

                <div
                  className="fullscreenButtonNext"
                  onClick={() => this.getNextElement()}
                >
                  <Icon autoFocus type="up" />
                  <span>Show more</span>
                </div>
                {!this.props.isSearchActivated && (
                  <button
                    className="inputFocus"
                    ref={button => button && button.focus()}
                  />
                )}
              </div>
            ) : (
              <div
                style={{
                  opacity: isLoading ? 0.1 : 1,
                  transition: "opacity 400ms"
                }}
                className="gridMedia"
              >
                {html}
              </div>
            ))}
          {isLoading && (
            <div className="iconSpinner">
              <Spin size="large" />
              <br />
              Loading next {collectionsMode ? "collection" : "subreddit"}
            </div>
          )}

          {!fullscreen && (
            <div className="loadMoreWrapper">
              {!collectionsMode &&
                !activeCollection &&
                !isLoading &&
                html &&
                html.length && (
                  <Button
                    onClick={() => {
                      this.loadMoreContent();
                    }}
                    type="primary"
                    loading={this.props.isLoadingMore}
                    className="loadMoreButton"
                  >
                    Show more
                  </Button>
                )}
            </div>
          )}
        </Swipeable>
      </div>
    );
  }
}

export default AddMarkup;
