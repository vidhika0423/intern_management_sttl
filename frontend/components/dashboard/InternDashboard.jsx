import { getInternDataById } from '@/services/dashboard/InternData';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'

function InternDashboard() {

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { data: session, status } = useSession();

    useEffect(() => {
        if (session?.user?.id) {
            getInternDataById(session.user.id)
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false))
        }
    }, [session])

    if (loading || status === "loading" || !data) {
        return (
            <div className="flex justify-center flex-col gap-4 items-center h-full w-full py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3aff]"></div>
                <p className="text-gray-500 font-medium">Loading your dashboard...</p>
            </div>
        )
    }

    const intern = data?.interns?.[0];

    const getStatusColor = (taskStatus) => {
        switch (taskStatus?.toLowerCase()) {
            case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_review': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-red-700 bg-red-50';
            case 'medium': return 'text-orange-700 bg-orange-50';
            case 'low': return 'text-emerald-700 bg-emerald-50';
            default: return 'text-gray-700 bg-gray-50';
        }
    };

    return (
        <div className='flex flex-col gap-6 w-full'>
            {/* Header Section */}
            <div className='bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900 mb-5'>Welcome, {session?.user?.name}</h1>
                    <div className='flex flex-wrap items-center gap-3'>
                        <span className='text-sm font-semibold bg-[#e8eeff] text-[#1a3aff] px-4 py-1.5 rounded-full border border-[#1a3aff]'>
                            {session?.user?.role || 'Intern'}
                        </span>
                        {intern?.department?.name && (
                            <span className='text-sm font-medium bg-[#e8eeff] text-[#1a3aff] border border-[#1a3aff] px-4 py-1.5 rounded-full'>
                                {intern.department.name} Department
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Left Column: Info & Evaluations */}
                <div className='flex flex-col gap-6 lg:col-span-1'>
                    {/* Personal Information */}
                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                        <h2 className='text-lg font-bold text-gray-900 mb-4 border-gray-100 flex items-center gap-2'>
                            Personal Information
                        </h2>
                        <div className='flex flex-col gap-4'>
                            <div>
                                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>Email Address</p>
                                <p className='text-base font-medium text-gray-900'>{session?.user?.email}</p>
                            </div>
                            {intern?.college && (
                                <div>
                                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>College / University</p>
                                    <p className='text-base font-medium text-gray-900'>{intern.college}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department Details */}
                    {intern?.department && (
                        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                            <h2 className='text-lg font-bold text-gray-900 mb-4 border-gray-100 flex items-center gap-2'>
                                Department Details
                            </h2>
                            <div className='flex flex-col gap-4'>
                                <div>
                                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>Department</p>
                                    <p className='text-base font-medium text-gray-900'>{intern.department.name}</p>
                                </div>
                                {intern.department.departmentHead && (
                                    <>
                                        <div>
                                            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>Department Head</p>
                                            <p className='text-base font-medium text-gray-900'>{intern.department.departmentHead.name}</p>
                                        </div>
                                        <div>
                                            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>Contact Email</p>
                                            <p className='text-base font-medium text-gray-900'>
                                                <a href={`mailto:${intern.department.departmentHead.email}`} className="text-[#1a3aff] hover:underline">
                                                    {intern.department.departmentHead.email}
                                                </a>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Evaluations */}
                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1'>
                        <h2 className='text-lg font-bold text-gray-900 mb-4 border-gray-100 flex items-center gap-2'>
                            Recent Evaluations
                        </h2>
                        {intern?.evaluations?.length > 0 ? (
                            <div className='flex flex-col gap-4'>
                                {intern.evaluations.map((evalItem, index) => (
                                    <div key={index} className='p-4 rounded-xl border border-gray-100 bg-gray-50 relative overflow-hidden'>
                                        <div className='flex justify-between items-center mb-2 pl-2'>
                                            <span className='text-sm font-bold text-gray-800'>{evalItem.period}</span>
                                            <div className='flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100'>
                                                <span className='text-sm font-bold text-[#1a3aff]'>{evalItem.score}</span>
                                                <span className='text-xs text-gray-500'>/10</span>
                                            </div>
                                        </div>
                                        <p className='text-sm text-gray-600 italic pl-2'>"{evalItem.feedback}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center p-6 text-center h-32'>
                                <p className='text-sm text-gray-500'>No evaluations available yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Tasks */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2'>
                    <div className='flex justify-between items-center mb-5 border-gray-100'>
                        <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                            Assigned Tasks
                        </h2>
                        <span className='bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200'>
                            {intern?.tasks?.length || 0} Total
                        </span>
                    </div>
                    
                    {intern?.tasks?.length > 0 ? (
                        <div className='flex flex-col gap-4'>
                            {intern.tasks.map((task, index) => (
                                <div key={index} className='p-5 rounded-xl border border-gray-200 hover:border-[#1a3aff]/30 hover:shadow-md transition-all duration-200 bg-white group'>
                                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4'>
                                        <h3 className='text-base font-bold text-gray-900 group-hover:text-[#1a3aff] transition-colors line-clamp-2'>{task.description}</h3>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap ${getStatusColor(task.status)} capitalize`}>
                                            {task.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <div className='flex flex-wrap items-center gap-5 text-sm pt-3 border-t border-gray-50'>
                                        <div className='flex items-center gap-2'>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            <span className='font-medium text-gray-600'>
                                                {new Date(task.due_date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        
                                        <div className='flex items-center gap-2'>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                                {task.priority || 'NORMAL'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50'>
                            <div className='w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm'>
                                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                            </div>
                            <p className='text-gray-700 font-bold'>No tasks assigned yet</p>
                            <p className='text-sm text-gray-500 mt-1'>You're all caught up! Check back later for new assignments.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default InternDashboard