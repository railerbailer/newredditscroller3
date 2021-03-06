import React from "react";
import { Card } from "antd";
import Link from "next/link";

const CardComponent = ({ title, madeBy, description, data, numberOfMedia }) => {
  const { Meta } = Card;
  const mediaSource = () => {
    if (data && Object.entries(data).length !== 0) {
      const theData = Object.entries(data);
      const filteredData = theData.filter(i => i);
      const firstCell = filteredData[0];
      const mediaData = firstCell[1];
      if (mediaData.image)
        return [
          "image",
          mediaData.image.low || mediaData.image.high || mediaData.image.source
        ];
      if (mediaData.video) return ["video", mediaData.video.url];
      if (mediaData.gif) return ["gif", mediaData.gif.url];
      else return ["none", "www.sliddit.com"];
    }
  };

  const source = () => {
    const sourceData = mediaSource();
    if (sourceData) {
      if (sourceData[0] === "gif" || sourceData[0] === "image") {
        return <img alt="piczz" src={sourceData[1]} />;
      } else if (sourceData[0] === "video") {
        return (
          <video>
            <source src={`${sourceData[1]}#t=0.1`} type="video/mp4" />
          </video>
        );
      } else {
        return null;
      }
    }
  };
  const getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  return (
    <Link href={`/collections/${title.replace(" ", "")}`}>
      <Card
        // className={`card ${mediaSource()[0]}`}
        hoverable
        cover={source()}
      >
        <Meta
          title={`${title.split(" ")[0]} (${numberOfMedia} items)`}
          description={`${description} Made by: ${madeBy}`}
        />
      </Card>
    </Link>
  );
};

export default CardComponent;
