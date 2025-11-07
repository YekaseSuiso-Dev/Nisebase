// node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/constants.mjs
var InjectionKey = Symbol("vitepress-nolebase-enhanced-readabilities");
var LayoutSwitchModeStorageKey = "vitepress-nolebase-enhanced-readabilities-layout-switch-mode";
var SpotlightToggledStorageKey = "vitepress-nolebase-enhanced-readabilities-spotlight-mode";
var LayoutMode = ((LayoutMode2) => {
  LayoutMode2[LayoutMode2["FullWidth"] = 1] = "FullWidth";
  LayoutMode2[LayoutMode2["Original"] = 3] = "Original";
  LayoutMode2[LayoutMode2["SidebarWidthAdjustableOnly"] = 4] = "SidebarWidthAdjustableOnly";
  LayoutMode2[LayoutMode2["BothWidthAdjustable"] = 5] = "BothWidthAdjustable";
  return LayoutMode2;
})(LayoutMode || {});
var SpotlightStyle = ((SpotlightStyle2) => {
  SpotlightStyle2[SpotlightStyle2["Under"] = 1] = "Under";
  SpotlightStyle2[SpotlightStyle2["Aside"] = 2] = "Aside";
  return SpotlightStyle2;
})(SpotlightStyle || {});

// node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/index.mjs
import NolebaseEnhancedReadabilitiesMenu from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/Menu.vue";
import NolebaseEnhancedReadabilitiesScreenMenu from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/ScreenMenu.vue";
import LayoutSwitch from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/LayoutSwitch.vue";
import LayoutSwitchContentLayoutMaxWidthSlider from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/LayoutSwitchContentLayoutMaxWidthSlider.vue";
import LayoutSwitchPageLayoutMaxWidthSlider from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/LayoutSwitchPageLayoutMaxWidthSlider.vue";
import ScreenLayoutSwitch from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/ScreenLayoutSwitch.vue";
import Spotlight from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/Spotlight.vue";
import ScreenSpotlight from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/ScreenSpotlight.vue";
import SpotlightStyles from "D:/Nisebase/node_modules/.pnpm/@nolebase+vitepress-plugin-_6234eeda06eeeae1844c23cfeb7de3ea/node_modules/@nolebase/vitepress-plugin-enhanced-readabilities/dist/client/components/SpotlightStyles.vue";
var components = {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
  NolebaseEnhancedReadabilitiesLayoutSwitch: LayoutSwitch,
  NolebaseEnhancedReadabilitiesScreenLayoutSwitch: ScreenLayoutSwitch,
  NolebaseEnhancedReadabilitiesSpotlight: Spotlight,
  NolebaseEnhancedReadabilitiesSpotlightStyles: SpotlightStyles,
  NolebaseEnhancedReadabilitiesScreenSpotlight: ScreenSpotlight
};
var NolebaseEnhancedReadabilitiesPlugin = {
  install(app, options) {
    if (typeof options !== "undefined" && typeof options === "object")
      app.provide(InjectionKey, options);
    for (const key of Object.keys(components))
      app.component(key, components[key]);
  }
};
export {
  InjectionKey,
  LayoutMode,
  LayoutSwitch,
  LayoutSwitchContentLayoutMaxWidthSlider,
  LayoutSwitchModeStorageKey,
  LayoutSwitchPageLayoutMaxWidthSlider,
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesPlugin,
  NolebaseEnhancedReadabilitiesScreenMenu,
  ScreenLayoutSwitch,
  ScreenSpotlight,
  Spotlight,
  SpotlightStyles,
  SpotlightToggledStorageKey
};
//# sourceMappingURL=@nolebase_vitepress-plugin-enhanced-readabilities_client.js.map
