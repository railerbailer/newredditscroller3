import React, { useState } from "react";
import { Spin } from "antd";
import ConsentForAge from "../components/consentForAge";
import Head from "next/head";
import Link from "next/link";
import "../App.css";

const Index = ({}) => {
  const [accepted, setAccepted] = useState(true);
  const [loading, setLoading] = useState(false);

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
      {loading ? (
        <div
          style={{
            zIndex: 1337,
            width: "100%",
            textAlign: "center",
            position: "absolute",
            color: "white",
            top: "40vh"
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          <h1 className="scrollLogo">sliddit.</h1>
          <ConsentForAge visible={!accepted} visibilityChange={setAccepted} />
          <div className="grid-container">
            )}
            <h2 className="item0">
              Scroll more than 1.000.000 of pics and gifs!
              <br />
              <p style={{ marginBottom: "-20px", fontSize: ".8em" }}>
                Pick a domain
              </p>
            </h2>
            <button
              onClick={() => {
                setAccepted(false);
                setLoading(true);
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
