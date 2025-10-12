import { SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { useAuthContext } from '@/hooks/useAuthContext'

function AppHeader() {
    const { user } = useAuthContext()

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