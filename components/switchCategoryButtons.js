import React from "react";
import Link from "next/link";
const SwitchCategoryButtons = props => {
  const {
    isSearchActivated,
    collectionsMode,
    showListInput,
    isModalVisible,
    nextCat,
    toggleIsLoading
  } = props;
  const noInputsActivated =
    !isSearchActivated && !showListInput && !isModalVisible;
  const switchCat = () => {
    window.stop();
    toggleIsLoading(true);
  };
  return (
    <Link href={`/subreddits/${nextCat}`}>
      <button
        ref={button => button && noInputsActivated && button.focus()}
        className="iconRight"
        onClick={switchCat}
      >
        <>
          <i className="material-icons">shuffle</i>
          <a>
            Shuffle
            <br />
            {collectionsMode ? "collections" : "subreddits"}
          </a>
        </>
      </button>
    </Link>
  );
};
export default SwitchCategoryButtons;
