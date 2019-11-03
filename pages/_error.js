import React, { useEffect } from "react";
import Router, { createRouter } from "next/router";
import { Empty } from "antd";
import ReactGA from "react-ga";
import Link from "next/link";

const MyError = ({ url }) => {
  useEffect(() => {
    const lastSubString = url[url.length - 1];
    if (lastSubString === "/") {
      const urlWithoutTrailingSlash = url.slice(0, -1);
      Router.push(urlWithoutTrailingSlash);
    }
  }, []);

  const trackError = val => {
    if (process.env.NODE_ENV === "development")
      ReactGA.event({
        category: "error",
        label: val,
        action: `Clicked ${val}`
      });
  };
  trackError(url);

  return (
    <Empty
      style={{ margin: "auto" }}
      description="Sorry! This page doesn't exist!"
      onClick={() => createRouter.push("/")}
    />
  );
};
MyError.getInitialProps = ctx => {
  return {
    url: ctx.req.url
  };
};
export default MyError;
