import * as components from "./components/index.mjs";
const install = {
  install(app) {
    for (const key in components)
      app.component(key, components[key]);
  }
};
export default install;
