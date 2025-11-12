import { createAvatar } from '@dicebear/core';
import { lorelei, notionists, personas, adventurer, micah } from '@dicebear/collection';

// Cache for the avatars
let cachedAvatars: Array<{
  id: string;
  seed: string;
  styleName: string;
  dataUri: string;
}> | null = null;

// Function to create avatar data URIs asynchronously
const createAvatarDataUri = async (style: any, seed: string): Promise<string> => {
  const avatar = createAvatar(style, {
    seed,
    size: 96,
  });
  return await avatar.toDataUri();
};

// Generate 16 modern DiceBear avatars
const loadAvatars = async () => {
  // Array of avatar configurations
  const avatarConfigs = [
    // Lorelei style - 3 avatars
    { id: 'dicebear-0', seed: 'profile-0', styleName: 'lorelei', style: lorelei },
    { id: 'dicebear-1', seed: 'profile-1', styleName: 'lorelei', style: lorelei },
    { id: 'dicebear-2', seed: 'profile-2', styleName: 'lorelei', style: lorelei },
    // Notionists style - 3 avatars
    { id: 'dicebear-3', seed: 'profile-3', styleName: 'notionists', style: notionists },
    { id: 'dicebear-4', seed: 'profile-4', styleName: 'notionists', style: notionists },
    { id: 'dicebear-5', seed: 'profile-5', styleName: 'notionists', style: notionists },
    // Personas style - 4 avatars
    { id: 'dicebear-6', seed: 'profile-6', styleName: 'personas', style: personas },
    { id: 'dicebear-7', seed: 'profile-7', styleName: 'personas', style: personas },
    { id: 'dicebear-8', seed: 'profile-8', styleName: 'personas', style: personas },
    { id: 'dicebear-9', seed: 'profile-9', styleName: 'personas', style: personas },
    // Adventurer style - 3 avatars
    { id: 'dicebear-10', seed: 'profile-10', styleName: 'adventurer', style: adventurer },
    { id: 'dicebear-11', seed: 'profile-11', styleName: 'adventurer', style: adventurer },
    { id: 'dicebear-12', seed: 'profile-12', styleName: 'adventurer', style: adventurer },
    // Micah style - 3 avatars
    { id: 'dicebear-13', seed: 'profile-13', styleName: 'micah', style: micah },
    { id: 'dicebear-14', seed: 'profile-14', styleName: 'micah', style: micah },
    { id: 'dicebear-15', seed: 'profile-15', styleName: 'micah', style: micah },
  ];

  // Create avatars in parallel
  const avatars = await Promise.all(
    avatarConfigs.map(async (config) => {
      const dataUri = await createAvatarDataUri(config.style, config.seed);
      return {
        id: config.id,
        seed: config.seed,
        styleName: config.styleName,
        dataUri,
      };
    }),
  );

  return avatars;
};

// Export the async function
export const dicebearAvatars = async () => {
  if (!cachedAvatars) {
    cachedAvatars = await loadAvatars();
  }
  return cachedAvatars;
};

// Export a synchronous getter that returns the cached avatars or throws if not loaded
export const getCachedAvatars = () => {
  if (!cachedAvatars) {
    throw new Error('Avatars not loaded. Call dicebearAvatars() first.');
  }
  return cachedAvatars;
};

// Preload the avatars when the module loads
dicebearAvatars().catch();
