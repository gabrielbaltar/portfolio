export const CMS_SAVE_SHORTCUT_EVENT = "cms:save-shortcut";

export function dispatchCMSSaveShortcut() {
  return window.dispatchEvent(
    new CustomEvent(CMS_SAVE_SHORTCUT_EVENT, {
      cancelable: true,
      detail: { source: "keyboard" },
    }),
  );
}
