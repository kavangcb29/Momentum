// Re-export from monetization.ts to ensure compatibility and prevent ad-blocker path collisions
export {
  monetizationManager as adMobManager,
  monetizationManager,
  AD_UNIT_IDS as ADMOB_TEST_IDS,
} from './monetization';
