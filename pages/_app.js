import React from "react";
import App from "next/app";
import Firebase, { FirebaseContext } from "../components/firebase";
import Head from "next/head";
import "../App.css";
import FloatingBalls from "../components/floatingBalls";

class MyApp extends App {
  // Only uncomment this method if you have blocking data requirements for
  // every single page in your application. This disables the ability to
  // perform automatic static optimization, causing every page in your app to
  // be server-side rendered.
  //
  // static async getInitialProps(appContext) {
  //   // calls page's `getInitialProps` and fills `appProps.pageProps`
  //   const appProps = await App.getInitialProps(appContext);
  //
  //   return { ...appProps }
  // }
  // state = {
  //   mobile: false,
  //   isLoadingMore: false,
  //   fullscreenActive: false,
  //   autoPlayVideo: true,
  //   isDropDownShowing: false,
  //   isLoading: false,
  //   isOnlyGifsShowing: false,
  //   isOnlyPicsShowing: false,
  //   isSearchActivated: false,
  //   autoCompleteDataSource: [],
  //   subreddit: "",
  //   category: "",
  //   isModalVisible: false,
  //   showListInput: false,
  //   newListName: "",
  //   userCollections: { "Register to use": "kek" },
  //   user: null,
  //   activeCollection: ""
  // };

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
        </Head>
        <FirebaseContext.Provider value={{ firebase: new Firebase() }}>
          <FirebaseContext.Consumer>
            {props => (
              <>
                <FloatingBalls />
                <Component {...pageProps} firebase={props.firebase} />
              </>
            )}
          </FirebaseContext.Consumer>
        </FirebaseContext.Provider>
      </>
    );
  }
}

export default MyApp;
