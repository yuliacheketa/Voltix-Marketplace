let mountedApp = null;

export default {
  async mount(target) {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return null;
    const { mountCheckout } = await import("./main.js");
    mountedApp = mountCheckout(el);
    return mountedApp;
  },
  unmount() {
    if (mountedApp) {
      mountedApp.$destroy();
      if (mountedApp.$el) mountedApp.$el.innerHTML = "";
      mountedApp = null;
    }
  },
};
