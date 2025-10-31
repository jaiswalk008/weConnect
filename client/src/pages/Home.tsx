import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authActions, type RootState } from '@/store/store';
import { ProfileSetupModal } from '@/components/common/ProfileSetupModal';
import { ChatLayout } from '@/components/layout/ChatLayout';
import { useLocation } from 'react-router-dom';
import { getMe } from '@/services/user';
import { toast } from 'sonner';
import { authRoutes } from '@/routes/routes';
// import Loader from '@/components/ui/loader';
import { ChatLayoutSkeleton } from '@/components/ui/ChatSkeletonLoader';
import { authUtils } from '@/utils/auth';

function Home() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { userData, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();
  const fetchMe = useCallback(async () => {
    try {
      const response = await getMe();
      dispatch(authActions.setUserData(response.data.user));
    } catch (error: any) {
      toast.error(error.response.data.message || 'Failed to fetch user data');
      authUtils.logout();
    } finally {
      setLoading(false);
    }
  }, [dispatch]);
  useEffect(() => {
    if (
      location.pathname !== authRoutes.LOGIN &&
      location.pathname !== authRoutes.SIGNUP &&
      location.pathname !== authRoutes.GOOGLE_CALLBACK
    ) {
      fetchMe();
    } else setLoading(false);
  }, [fetchMe, location.pathname]);

  useEffect(() => {
    if (token && !userData?.username) {
      setShowProfileModal(true);
    }
  }, [userData?.username, token]);
  if (loading) {
    return <ChatLayoutSkeleton />;
  }
  return (
    <>
      <ProfileSetupModal open={showProfileModal} setOpen={setShowProfileModal} />
      <ChatLayout />
    </>
  );
}

export default Home;
