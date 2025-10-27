import { createAvatar } from '@dicebear/core'
import { lorelei, notionists, personas, adventurer, micah } from '@dicebear/collection'

  // Generate 16 modern DiceBear avatars
  export const dicebearAvatars = [
    // Lorelei style - 3 avatars
    {
      id: 'dicebear-0',
      seed: 'profile-0',
      styleName: 'lorelei',
      dataUri: createAvatar(lorelei, { seed: 'profile-0', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-1',
      seed: 'profile-1',
      styleName: 'lorelei',
      dataUri: createAvatar(lorelei, { seed: 'profile-1', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-2',
      seed: 'profile-2',
      styleName: 'lorelei',
      dataUri: createAvatar(lorelei, { seed: 'profile-2', size: 96 }).toDataUri(),
    },
    // Notionists style - 3 avatars
    {
      id: 'dicebear-3',
      seed: 'profile-3',
      styleName: 'notionists',
      dataUri: createAvatar(notionists, { seed: 'profile-3', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-4',
      seed: 'profile-4',
      styleName: 'notionists',
      dataUri: createAvatar(notionists, { seed: 'profile-4', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-5',
      seed: 'profile-5',
      styleName: 'notionists',
      dataUri: createAvatar(notionists, { seed: 'profile-5', size: 96 }).toDataUri(),
    },
    // Personas style - 4 avatars
    {
      id: 'dicebear-6',
      seed: 'profile-6',
      styleName: 'personas',
      dataUri: createAvatar(personas, { seed: 'profile-6', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-7',
      seed: 'profile-7',
      styleName: 'personas',
      dataUri: createAvatar(personas, { seed: 'profile-7', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-8',
      seed: 'profile-8',
      styleName: 'personas',
      dataUri: createAvatar(personas, { seed: 'profile-8', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-9',
      seed: 'profile-9',
      styleName: 'personas',
      dataUri: createAvatar(personas, { seed: 'profile-9', size: 96 }).toDataUri(),
    },
    // Adventurer style - 3 avatars
    {
      id: 'dicebear-10',
      seed: 'profile-10',
      styleName: 'adventurer',
      dataUri: createAvatar(adventurer, { seed: 'profile-10', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-11',
      seed: 'profile-11',
      styleName: 'adventurer',
      dataUri: createAvatar(adventurer, { seed: 'profile-11', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-12',
      seed: 'profile-12',
      styleName: 'adventurer',
      dataUri: createAvatar(adventurer, { seed: 'profile-12', size: 96 }).toDataUri(),
    },
    // Micah style - 3 avatars
    {
      id: 'dicebear-13',
      seed: 'profile-13',
      styleName: 'micah',
      dataUri: createAvatar(micah, { seed: 'profile-13', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-14',
      seed: 'profile-14',
      styleName: 'micah',
      dataUri: createAvatar(micah, { seed: 'profile-14', size: 96 }).toDataUri(),
    },
    {
      id: 'dicebear-15',
      seed: 'profile-15',
      styleName: 'micah',
      dataUri: createAvatar(micah, { seed: 'profile-15', size: 96 }).toDataUri(),
    },
  ]