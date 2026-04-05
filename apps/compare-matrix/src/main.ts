import("./bootstrap")
  .then((m) => {
    const el =
      document.querySelector("app-root") ?? document.getElementById("app");
    if (el instanceof HTMLElement) {
      void m.default.mount(el);
    }
  })
  .catch((err) => console.error(err));
