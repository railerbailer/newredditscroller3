import React, { useState } from "react";
import Link from "next/link";
import { Button } from "antd";

const ConsentForAge = ({ visible, visibilityChange }) => {
  const [loading, setLoading] = useState(false);
  return (
    visible && (
      <div className="webkitTransform" style={styling.wrapper}>
        <div style={styling.innerWrapper}>
          <div style={{ padding: "30px" }}>
            <span style={styling.span}>
              This site may include adult content.
            </span>
            <br />
            <span style={styling.span}>You must be 18+ to enter.</span>
            <br />
            <br />
            <span>Do you want to continue?</span>
            <br />
            <br />
            <Button
              size="large"
              onClick={() => visibilityChange(false)}
              style={styling.button}
            >
              No
            </Button>
            <Link href="/r/nsfw">
              <Button
                size="large"
                type="primary"
                onClick={() => setLoading(true)}
                loading={loading}
                style={styling.button}
              >
                Yes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  );
};
export default ConsentForAge;
const styling = {
  span: {
    fontSize: 16
  },
  wrapper: {
    zIndex: 99999999999999999,
    background: "rgb(20,20,20, 0.6)",
    height: "100vh",
    width: "100vw",
    top: 0,
    left: 0,
    position: "fixed"
  },
  innerWrapper: {
    background: "rgb(20,20,20, 0.2)",
    fontSize: 20,
    zIndex: 99999999999999999,
    borderRadius: 10,
    background: "white",
    opacity: 0.95,
    height: "320px",
    top: "25vh",
    left: "calc(50vw - 160px)",
    width: "322px",
    maxWidth: "100vw",
    textAlign: "center",
    position: "absolute",
    color: "black"
  },
  button: {
    borderRadius: 5,
    fontSize: 16,
    cursor: "pointer",
    margin: 10,
    width: "40%"
  }
};
