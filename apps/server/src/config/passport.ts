import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database';
import logger from './logger';
import userRepository from '../repository/user.repository';

const configurePassport: () => void = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }
          const profilePicUrl = profile.photos?.[0]?.value || null;

          let user = await userRepository.getUser({
            OR: [{ email }, { google_id: profile.id }],
          });

          if (user) {
            if (profilePicUrl && user.profile_image !== profilePicUrl) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  profile_image: profilePicUrl,
                  google_id: profile.id,
                },
              });
            }
          } else {
            user = await userRepository.createUser({
              username: profile.displayName || email.split('@')[0] || 'User',
              email,
              name: profile.displayName || email.split('@')[0] || 'User',
              password: '',
              google_id: profile.id,
              profile_image: profilePicUrl,
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error('Google auth error:', error);
          return done(error);
        }
      }
    )
  );

  // IMPORTANT: Add serialization
  passport.serializeUser((user: any, done): void => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done): Promise<void> => {
    try {
      const user = await userRepository.getUser({ id: parseInt(id) });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
