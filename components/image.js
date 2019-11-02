import React, { useState } from "react";
import { Icon, Dropdown, Menu, message } from "antd";
import GoogleAnalytics from "react-ga";

const trackImage = url => {
  console.log("tracking", url);
  if (process.env.NODE_ENV !== "development")
    GoogleAnalytics.event({
      category: "affiliateImage",
      action: `Clicked ${url}`
    });
};

const Image = ({
  className,
  src,
  toggleFullscreen,
  index,
  ratioClassName,
  addMediaToCollection,
  firebaseId,
  fullscreen,
  setLoadedData,
  loadedData,
  permalink,
  title,
  collections,
  affiliateLink
}) => {
  const [isDropDownShowing, setDropDown] = useState(false);

  const menu = () => {
    const lists = Object.keys(collections).reverse();
    const srcKey = className === "gif" ? "url" : "low";
    const listMenuItem = lists.map(list => (
      <Menu.Item
        key={list}
        onClick={() => {
          addMediaToCollection(
            {
              [firebaseId]: {
                title: title || null,
                permalink: permalink || null,
                [className]: {
                  className: ratioClassName,
                  [srcKey]: src
                }
              }
            },
            list
          );
          setDropDown(false);
          message.info(`Added to collection ${list}`);
        }}
      >
        <Icon style={{ marginRight: 5 }} type="save" />
        {list}
      </Menu.Item>
    ));
    return (
      <Menu>
        <div className="addToCollectionModal">
          <Icon type="bank" /> <strong>Add to bank</strong>
          <Icon
            style={{
              float: "right",
              fontSize: 18
            }}
            onClick={() => setDropDown(false)}
            type="close"
          />
        </div>

        {!lists.length && (
          <div onClick={() => toggleIsModalVisible()}>
            <Icon style={{ marginLeft: 4 }} type="login" />
            Log in or register
          </div>
        )}
        {listMenuItem}
      </Menu>
    );
  };

  return (
    <>
      {affiliateLink && (
        <a
          onClick={e => affiliateLink && trackImage(e.target.href || e.target)}
          href={affiliateLink}
          target={affiliateLink && "_blank"}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 999999999999
          }}
        >
          .
        </a>
      )}
      <img
        {...{ name: "hej" }}
        onBlur={() => setDropDown(false)}
        onLoad={() => setLoadedData(loadedData + 2)}
        onError={() => console.log("Image error")}
        onClick={() => {
          setDropDown(false);
          toggleFullscreen(index);
        }}
        alt="Could not be loaded"
        className={className}
        // ref={img => (this.img = img)}
        src={src}
      />
      {permalink && (
        <a
          rel="noopener noreferrer"
          target="_blank"
          href={permalink}
          style={{ zIndex: fullscreen ? 999 : 5 }}
          className="linkToSource"
        >
          <Icon style={{ zIndex: fullscreen ? 999 : 5 }} type="link" />
        </a>
      )}
      <Dropdown
        overlayStyle={{ zIndex: fullscreen ? 999 : 5 }}
        overlayClassName="mediaAddDropdown"
        placement="topRight"
        visible={isDropDownShowing}
        overlay={menu()}
      >
        <div
          style={{ zIndex: fullscreen ? 999 : 2 }}
          onClick={() => setDropDown(!isDropDownShowing)}
          className="addNewMediaIcon"
          onBlur={() => setDropDown(false)}
        >
          {!affiliateLink && (
            <Icon
              style={{ zIndex: fullscreen ? 999 : 2 }}
              className="addNewMediaIcon"
              type={isDropDownShowing ? "up" : "bank"}
            />
          )}
        </div>
      </Dropdown>
    </>
  );
};

export default Image;
