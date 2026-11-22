import * as Haptics from 'expo-haptics';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ACTIONS = {
  tap: () => Haptics.selectionAsync(),
  watered: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  alert: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  stageUp: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await wait(180);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
};

/** Nunca lanza: un fallo de vibración no debe romper la app. */
export function haptic(kind) {
  const action = ACTIONS[kind];
  if (action) Promise.resolve().then(action).catch(() => {});
}