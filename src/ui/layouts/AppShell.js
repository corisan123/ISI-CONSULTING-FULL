/**
 * AppShell — Truth Collective layout (Phase 7)
 * Page chrome. Styles live in layouts.css via theme.css variables.
 */
export function AppShell(options) {
  options = options || {};
  var root = document.createElement("div");
  root.className = "tc-app";
  root.setAttribute("data-page", options.page || "");

  var content = document.createElement("div");
  content.className = "tc-app__content";
  root.appendChild(content);

  if (options.children instanceof Node) content.appendChild(options.children);

  root.content = content;
  return root;
}

export function adoptShell(shell) {
  var page = document.querySelector(".isi-page");
  var footer = document.querySelector(".isi-footer");

  if (!page) {
    document.body.appendChild(shell);
  } else {
    page.parentNode.insertBefore(shell, page);
    shell.content.appendChild(page);
    page.classList.add("tc-page");
  }

  if (footer) {
    footer.classList.add("tc-app__footer");
    shell.appendChild(footer);
  }

  document.body.classList.add("tc-app-body");
  return shell;
}

export default AppShell;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.AppShell = AppShell;
}
