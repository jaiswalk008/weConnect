import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { type RootState } from '@/store/store'
import { ProfileSetupModal } from '@/components/common/ProfileSetupModal'
import { ChatLayout } from '@/components/layout/ChatLayout'

function Home() {
    const [showProfileModal, setShowProfileModal] = useState(false)
    const {userData} = useSelector((state: RootState) => state.auth)
    console.log(userData)
    useEffect(() => {
        if (!userData?.username) {
            setShowProfileModal(true)
        }
    }, [userData?.username])
  return (
    <>
        <ProfileSetupModal open={showProfileModal} setOpen={setShowProfileModal} />
        <ChatLayout/>
    </>
  )
}

export default Home;