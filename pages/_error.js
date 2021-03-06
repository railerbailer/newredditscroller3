import React, { useEffect, useState } from "react";
import Router from "next/router";
import { Empty, Button } from "antd";
import ReactGA from "react-ga";

const MyError = ({ url }) => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const lastSubString = url[url.length - 1];
    if (lastSubString === "/") {
      const urlWithoutTrailingSlash = url.slice(0, -1);
      Router.push(urlWithoutTrailingSlash);
    }
  }, []);

  const trackError = val => {
    if (process.env.NODE_ENV !== "development")
      ReactGA.event({
        category: "error",
        label: val,
        action: `Clicked ${val}`
      });
  };
  trackError(url);

  return (
    <div style={{ zIndex: 9812319238123 }}>
      <h1
        style={{ zIndex: 8132193819831983192 }}
        onClick={() => Router.push("/")}
        className="scrollLogo"
      >
        sliddit.
      </h1>
      <Empty
        style={{ margin: "auto" }}
        description="Sorry! This page doesn't exist!"
        onClick={() => Router.push("/")}
      >
        <Button
          loading={loading}
          type="primary"
          onClick={() => {
            setLoading(true);
            Router.push("/");
          }}
        >
          Go back
        </Button>
      </Empty>
    </div>
  );
};
MyError.getInitialProps = ctx => {
  return {
    url: ctx.req.url
  };
};
export default MyError;
