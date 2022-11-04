const ICONS_PATH = "/img/icons/";

const getFullIconURL = (iconName) => {
  return chrome.runtime.getURL(ICONS_PATH + iconName);
};

const ICONS = {
  github: getFullIconURL("github-icon.png"),
  vscode: getFullIconURL("vscode-icon.png"),
  remote: getFullIconURL("remote.png"),
};

const getCurrentUrl = () => {
  return window.location.href;
};

const isInPr = () => {
  return getCurrentUrl().includes("/pull/");
};

const getRemoteUrl = () => {
  const currentUrl = getCurrentUrl();
  return `vscode-insiders://ms-vscode.remote-repositories/open?url=${currentUrl}`;
};

const getDevURL = () => {
  const currentRepo = getCurrentUrl();
  return currentRepo.replace("github.com", "github.dev");
};

const getNavbarLastElementChild = () => {
  if (!isInPr()) {
    const navbar = document.querySelector(".file-navigation");
    if (!navbar) return null;
    return navbar.lastElementChild;
  } else {
    const header_actions = document.querySelector(".gh-header-actions");
    if (!header_actions) return null;
    return header_actions;
  }
};

const isAlreadyAdded = () => {
  const lastNavbarChild = getNavbarLastElementChild();
  if (!lastNavbarChild) return null;
  return lastNavbarChild.querySelector("#ghe-buttons") !== null;
};

const getCodeButton = () => {
  const lastNavbarChild = getNavbarLastElementChild();
  if (!lastNavbarChild) return null;
  return lastNavbarChild;
};

const generateButton = ({flatSide, icon, url, title}) => {
  const linkIcon = document.createElement("img");
  const linkElement = document.createElement("a");

  linkElement.classList.add(
    "btn",
    "BtnGroup-item",
    "d-flex",
    "flex-items-center",
    flatSide === "all" ? "rounded-0" : `rounded-${flatSide}-0`,
    "tooltipped",
    "tooltipped-s"
  );

  linkIcon.src = icon;
  linkIcon.width = "16";
  linkIcon.height = "16";

  linkElement.append(linkIcon);
  linkElement.href = url;
  linkElement.setAttribute("aria-label", title);

  return linkElement;
};

const generateButtonsGroup = () => {
  const buttonsGroup = document.createElement("div");
  buttonsGroup.classList.add("mr-2", "d-inline-flex", "BtnGroup");
  buttonsGroup.id = "ghe-buttons";

  const buttons = [
    { flatSide: "right", icon: ICONS.github, url: getDevURL(), title: "Open in GitHub.dev" },
    { flatSide: "left", icon: ICONS.remote, url: getRemoteUrl(), title: "Open in VSCode (remote repository)" }
  ]

  buttons.map(generateButton).map(button => buttonsGroup.append(button));

  return buttonsGroup;
};

const insertButtons = async () => {
  const button = getCodeButton();
  if (button && !isAlreadyAdded()) {
    const buttonsGroup = generateButtonsGroup();
    button.prepend(buttonsGroup);
  }
};

const isReady = () => {
  const readyState = document.readyState;
  return readyState === "interactive" || readyState === "complete";
};

if (isReady()) {
  insertButtons();
} else {
  document.addEventListener("DOMContentLoaded", insertButtons());
}

// https://stackoverflow.com/a/39628037
document.addEventListener("pjax:end", () => {
  insertButtons();
});
