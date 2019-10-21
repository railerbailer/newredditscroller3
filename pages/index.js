import React, { useState } from "react";
import FloatingBalls from "../components/floatingBalls";
import ConsentForAge from "../components/consentForAge";
import Head from "next/head";
import Link from "next/link";
import "../App.css";

const Index = ({}) => {
  const [accepted, setAccepted] = useState(true);
  const pushHistory = subreddit => {
    // this.props.history.push(subreddit);
  };

  return (
    <div className="categoryModal">
      <Head>
        <meta
          name="description"
          content="Your site for scrolling pictures and gifs from subreddits."
        />
        <meta
          name="keywords"
          content="NSFW, NSFW pics,nsfw gifs, nsfw pictures, not safe for work, SFW"
        />
      </Head>
      <FloatingBalls />
      <h1 className="scrollLogo">sliddit.</h1>
      <ConsentForAge visible={!accepted} visibilityChange={setAccepted} />
      <div className="grid-container">
        <h2 className="item0">
          Scroll more than 1.000.000 of pics and gifs!
          <br />
          <p style={{ marginBottom: "-20px", fontSize: ".8em" }}>
            Pick a domain
          </p>
        </h2>
        <button onClick={() => setAccepted(false)} className="item1">
          NSFW (18+)
        </button>
        <Link href="/subreddits/pics">
          <button className="item2">Safe for work</button>
        </Link>
        <Link href="/subreddits">
          <a className="item3">Browse all subreddits</a>
        </Link>
      </div>
      <div
        style={{
          position: "absolute",
          margin: "auto",
          display: "block",
          bottom: 10,
          width: "100%",
          textAlign: "center",
          color: "white"
        }}
      >
        <h3>Save your favorites in collections and share!</h3>
      </div>
    </div>
  );
};

export default Index;
