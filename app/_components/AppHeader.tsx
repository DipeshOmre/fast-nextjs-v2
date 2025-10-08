import { SidebarTrigger } from '@/components/ui/sidebar'
import React, { useEffect, useState } from 'react'
import { auth } from '@/configs/firebaseConfig'
import { User } from 'firebase/auth'


function AppHeader() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser)
        })
        return () => unsubscribe()
    }, [])

    return (
        <div className='p-4 shadow-sm flex items-center justify-between w-full'>
            <SidebarTrigger />
            {user && (
                <img
                    src={'/prof.jpg'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-indigo-200 object-cover"
                />
            )}
        </div>
    )
}

export default AppHeader