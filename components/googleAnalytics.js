import ReactGA from "react-ga";

export const initGA = () => {
  ReactGA.initialize("UA-121718818-1");
};

export const logPageView = () => {
  if (!process.env.NODE_ENV === "production") {
    console.log("pageview triggered");
    return;
  }
  console.log("pageview registered");
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};
