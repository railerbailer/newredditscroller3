import React, { useState } from "react";
import { Spin } from "antd";
import ConsentForAge from "../components/consentForAge";
import Head from "next/head";
import Link from "next/link";
import "../App.css";

const Index = ({}) => {
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="categoryModal">
      <Head>
        <title>sliddit - images and pics from all subreddits</title>
        <meta
          name="description"
          content="Scroll images and pics from all subreddits r/"
        />
        <meta
          name="keywords"
          content="subreddit, subreddits, subreddit nsfw, nsfw, sfw, nsfw pics, nsfw gifs, not safe for work"
        />
      </Head>
      {loading ? (
        <div
          style={{
            zIndex: 11231312313212337,
            width: "100%",
            textAlign: "center",
            position: "fixed",
            color: "white",
            top: "40vh"
          }}
        >
          <div>
            <Spin size="large" />
            <br />
            Loading media...
          </div>
        </div>
      ) : (
        <>
          <h1 className="scrollLogo">sliddit.</h1>
          <ConsentForAge visible={consent} visibilityChange={setConsent} />
          <div className="grid-container">
            <h2 className="item0">
              Scroll more than 1.000.000 of pics and gifs!
              <br />
              <p style={{ marginBottom: "-20px", fontSize: ".8em" }}>
                Pick a domain
              </p>
            </h2>
            <button
              onClick={() => {
                setConsent(true);
              }}
              className="item1"
            >
              NSFW (18+)
            </button>
            <Link href="/subreddits/pics">
              <button onClick={() => setLoading(true)} className="item2">
                Safe for work
              </button>
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
        </>
      )}
    </div>
  );
};

export default Index;
