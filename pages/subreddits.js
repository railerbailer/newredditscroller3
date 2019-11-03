import React from "react";
import "../App.css";
import "antd/dist/antd.css";
import { flatMap } from "lodash";

import {
  gifsArray,
  sfwarray,
  straight,
  artArray,
  foodArray,
  animalsArray,
  alternativeNSFW,
  amateurNSFW,
  tattooNSFW,
  collegeNSFW,
  gonewildNSFW,
  selfieNSFW,
  analNSFW,
  buttplugNSFW,
  assNSFW,
  athleticNSFW,
  fatNSFW,
  bigdickNSFW,
  bimboNSFW,
  boobsNSFW,
  titfuckNSFW,
  sexyclothingNSFW,
  cuckoldNSFW,
  otherNSFW,
  bdsmNSFW,
  indianNSFW,
  blackNSFW,
  asianNSFW,
  cumNSFW,
  pornnetworksNSFW
} from "../public/utils/subredditsArrayConstants";
import ListOfSubreddits from "../components/listOfSubreddits";
import GoBackButton from "../components/goBackButton";
import Router from "next/router";
import Head from "next/head";
const SubredditsList = props => {
  const allCategories = {
    gifsArray,
    sfwarray,
    straight,
    artArray,
    foodArray,
    animalsArray,
    alternativeNSFW,
    amateurNSFW,
    tattooNSFW,
    collegeNSFW,
    gonewildNSFW,
    selfieNSFW,
    analNSFW,
    buttplugNSFW,
    assNSFW,
    athleticNSFW,
    fatNSFW,
    bigdickNSFW,
    bimboNSFW,
    boobsNSFW,
    titfuckNSFW,
    sexyclothingNSFW,
    cuckoldNSFW,
    otherNSFW,
    bdsmNSFW,
    indianNSFW,
    blackNSFW,
    asianNSFW,
    cumNSFW,
    pornnetworksNSFW
  };
  return (
    <>
      <Head>
        <title>List of subreddits</title>
        <meta
          name="description"
          content="List of more than 1.000.000 subreddits"
        />
        <meta
          name="keywords"
          content={flatMap(Object.values(allCategories), item => item).join(
            ", "
          )}
        />
      </Head>
      <GoBackButton goBackFunc={Router.back} />
      <h1 style={{ color: "white", textAlign: "center" }}>All subreddits</h1>
      <div className="subredditsListWrapper">
        {Object.entries(allCategories).map((category, i) => {
          return (
            <ListOfSubreddits
              key={i}
              title={category[0]}
              subreddits={category[1]}
            />
          );
        })}
      </div>
    </>
  );
};
export default SubredditsList;
