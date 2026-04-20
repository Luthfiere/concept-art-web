const WARN_THRESHOLD = 30;
const AUTO_CLOSE_THRESHOLD = 50;
const REQUIRE_EDIT_THRESHOLD = 80;

export function reportAction(count) {
  if (count >= REQUIRE_EDIT_THRESHOLD) {
    return { status: 'Auto-Closed', requireEdit: true };
  }
  if (count >= AUTO_CLOSE_THRESHOLD) {
    return { status: 'Auto-Closed' };
  }
  if (count >= WARN_THRESHOLD) {
    return { warn: true };
  }
  return null;
}

export const THRESHOLDS = {
  WARN: WARN_THRESHOLD,
  AUTO_CLOSE: AUTO_CLOSE_THRESHOLD,
  REQUIRE_EDIT: REQUIRE_EDIT_THRESHOLD,
};
