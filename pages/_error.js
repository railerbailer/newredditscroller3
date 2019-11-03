import React, { useEffect } from "react";
import Router from "next/router";
import { Empty } from "antd";

const MyError = ({ url }) => {
  useEffect(() => {
    const lastSubString = url[url.length - 1];
    if (lastSubString === "/") {
      const urlWithoutTrailingSlash = url.slice(0, -1);
      Router.push(urlWithoutTrailingSlash);
    }
  }, []);

  return <Empty style={{ margin: "auto" }} description=" " />;
};
MyError.getInitialProps = ctx => {
  return {
    url: ctx.req.url
  };
};
export default MyError;
