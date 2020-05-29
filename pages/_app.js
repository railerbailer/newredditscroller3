import React from "react";
import App from "next/app";
import { initGA, logPageView } from "../components/googleAnalytics.js";
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
  state = {
    mobile: false,
    isLoadingMore: false,
    fullscreen: false,
    autoPlayVideo: false,
    isDropDownShowing: false,
    isLoading: false,
    isOnlyGifsShowing: false,
    isOnlyPicsShowing: false,
    isSearchActivated: false,
    nextSubreddit: "",
    autoCompleteDataSource: [],
    subreddit: "",
    category: "",
    isModalVisible: false,
    showListInput: false,
    userCollections: { "Register to use": "kek" },
    user: null,
    activeCollection: ""
  };

  changeState = state => {
    this.setState(state);
  };

  componentDidMount() {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Varela+Round"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:300"
            rel="stylesheet"
          />
        </Head>
        <FirebaseContext.Provider
          value={{
            firebase: new Firebase(),
            context: this.state,
            changeContext: this.changeState
          }}
        >
          <FirebaseContext.Consumer>
            {props => (
              <>
                <FloatingBalls />
                <Component
                  {...pageProps}
                  firebase={props.firebase}
                  context={props.context}
                  changeContext={props.changeContext}
                />
              </>
            )}
          </FirebaseContext.Consumer>
        </FirebaseContext.Provider>
      </>
    );
  }
}

export default MyApp;
