import("./bootstrap.js").then((m) => {
  const el = document.getElementById("app");
  if (el) m.default.mount(el);
});
