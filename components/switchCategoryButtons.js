import React, { useState } from "react";
const SwitchCategoryButtons = props => {
  const [nextSubreddit, setNextSubreddit] = useState("");
  const {
    isSearchActivated,
    collectionsMode,
    showListInput,
    isModalVisible,
    switchCat
  } = props;
  const noInputsActivated =
    !isSearchActivated && !showListInput && !isModalVisible;
  return (
    <button
      ref={button => button && noInputsActivated && button.focus()}
      className="iconRight"
    >
      <i onClick={switchCat} className="material-icons">
        shuffle
      </i>
      <a onClick={switchCat}>
        Shuffle <br />
        {collectionsMode ? "collections" : "subreddits"}
      </a>
    </button>
  );
};
export default SwitchCategoryButtons;
