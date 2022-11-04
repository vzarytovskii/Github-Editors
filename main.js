﻿const ICONS_PATH = "/img/icons/";

const getFullIconURL = (iconName) => {
  return chrome.runtime.getURL(ICONS_PATH + iconName);
};

const ICONS = {
  github: getFullIconURL("github-icon.png"),
  vscode: getFullIconURL("vscode-icon.png"),
};

const getRepoURL = () => {
  return window.location.href;
};

const getCloneURL = () => {
  const currentRepo = getRepoURL();
  return `vscode-insiders://vscode.git/clone?url=${currentRepo}.git`;
};

const getPRUrl = () => {
  const currentRepo = getRepoURL();
  return `${currentRepo}/pulls`;
};


const getViewURL = () => {
  const currentRepo = getRepoURL();
  return currentRepo.replace("github.com", "github.dev");
};

const getNavbarLastElementChild = () => {
  const navbar = document.querySelector(".file-navigation");
  if (!navbar) return null;
  return navbar.lastElementChild;
};

const isAlreadyAdded = () => {
  const lastNavbarChild = getNavbarLastElementChild();
  if (!lastNavbarChild) return null;
  return lastNavbarChild.querySelector("#ghe-buttons") !== null;
};

const getCodeButton = () => {
  const lastNavbarChild = getNavbarLastElementChild();
  if (!lastNavbarChild) return null;
  if (
    !lastNavbarChild.lastElementChild || // check if there is child
    lastNavbarChild.lastElementChild.tagName !== "GET-REPO" // check if we are @ repo homepage
  )
    return null;
  return lastNavbarChild;
};

const generateButton = (flatSide, image, link, tooltipText) => {
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

  linkIcon.src = image;
  linkIcon.width = "16";
  linkIcon.height = "16";

  linkElement.append(linkIcon);
  linkElement.href = link;
  linkElement.setAttribute("aria-label", tooltipText);

  return linkElement;
};

const generateJetbrainsButtons = () => {
  const jetbrainsButtons = [];
  const jetbrainsIDELabels = getJetbrainsIDELabels();
  for (let ideLabel of jetbrainsIDELabels) {
    const currentTool = JETBRAINS_TOOLS[ideLabel];
    const jetbrainsButton = generateButton(
      "all",
      currentTool.icon,
      getJetbrainsURL(currentTool.tag),
      `Clone in ${currentTool.name}`
    );
    jetbrainsButtons.push(jetbrainsButton);
  }
  return jetbrainsButtons;
};

const generateButtonsGroup = (showJbButtons) => {
  const buttonsGroup = document.createElement("div");
  buttonsGroup.classList.add("mr-2", "d-inline-flex", "BtnGroup");
  buttonsGroup.id = "ghe-buttons";

  const vscodeButton = generateButton(
    "right",
    ICONS.vscode,
    getCloneURL(),
    "Clone in VSCode"
  );
  const githubdevButton = generateButton(
    "left",
    ICONS.github,
    getViewURL(),
    "Open in GitHub.dev"
  );

  buttonsGroup.append(vscodeButton);
  buttonsGroup.append(githubdevButton);

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
