import React, { useState } from "react";
import { Button, Icon } from "antd";
import Link from "next/link";

const SubredditLink = ({ subreddit }) => {
  const [loading, setLoading] = useState(false);
  return (
    <Link href={`subreddits/${subreddit}`}>
      <a onClick={() => setLoading(true)}>
        {subreddit}
        {loading && <Icon type="loading" />}
      </a>
    </Link>
  );
};
const ListOfSubreddits = ({ title, subreddits }) => {
  const [showMore, setShowMore] = useState(20);
  const fixedTitle = title
    .toUpperCase()
    .replace("ARRAY", "")
    .replace("NSFW", "")
    .replace("STRAIGHT", "ALL NSFW");

  return (
    <div className="subredditsList">
      <h2>
        {fixedTitle} ({subreddits.length})
      </h2>
      {subreddits.slice(0, showMore).map((subreddit, i) => (
        <SubredditLink key={i} subreddit={subreddit} />
      ))}
      {subreddits.length > 20 && (
        <Button
          className="showMoreButton"
          onClick={() => setShowMore(showMore + 15)}
        >
          Show more
        </Button>
      )}
    </div>
  );
};
export default ListOfSubreddits;
