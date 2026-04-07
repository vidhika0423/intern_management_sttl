'use client'

import { getInternDataById } from '@/services/dashboard/InternData';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import ChangePassword from './ChangePassword';

function InternDashboard() {

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            getInternDataById(session?.user?.id)
                .then(setData)
                .catch(setError)
                .finally(() => setLoading(false))
        } else if (status === 'unauthenticated') {
            setLoading(false)
        }
    }, [status, session])

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

    if (loading || status === 'loading') {
        return (
            <div className="flex justify-center flex-col gap-4 items-center h-full w-full py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3aff]"></div>
                <p className="text-gray-500 font-medium">Loading your dashboard...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center flex-col gap-3 items-center h-full w-full py-20">
                <p className="text-red-500 font-semibold text-lg">Could not load dashboard</p>
                <p className="text-gray-400 text-sm">{error?.message || 'An unexpected error occurred.'}</p>
            </div>
        )
    }

    const intern = data?.interns?.[0];

    // No intern record linked yet — show a friendly setup message
    if (!intern) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome, {session?.user?.name}</h1>
                    <span className="text-sm font-semibold bg-[#e8eeff] text-[#1a3aff] px-4 py-1.5 rounded-full border border-[#1a3aff]">
                        {session?.user?.role || 'Intern'}
                    </span>
                </div>
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3">
                    <div className="text-4xl">📋</div>
                    <p className="text-gray-700 font-bold text-lg">Your profile is not set up yet</p>
                    <p className="text-gray-500 text-sm max-w-sm">
                        Your intern record hasn't been created yet. Please contact your HR or Administrator to complete your onboarding.
                    </p>
                </div>
            </div>
        )
    }

    const tasks = intern?.tasks ?? []
    const evaluations = intern?.evaluations ?? []
    const attendances = intern?.attendances ?? []

    const attendanceCounts = attendances.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {})

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Header */}
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-5">Welcome, {session?.user?.name}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold bg-[#e8eeff] text-[#1a3aff] px-4 py-1.5 rounded-full border border-[#1a3aff]">
                            {session?.user?.role || 'Intern'}
                        </span>
                        {intern?.department?.name && (
                            <span className="text-sm font-medium bg-[#e8eeff] text-[#1a3aff] border border-[#1a3aff] px-4 py-1.5 rounded-full">
                                {intern.department.name} Department
                            </span>
                        )}
                        {intern?.position_title && (
                            <span className="text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 px-4 py-1.5 rounded-full">
                                {intern.position_title}
                            </span>
                        )}
                    </div>
                </div>
                <div className='flex gap-2'>
                    <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border uppercase tracking-wide
                        ${intern.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {intern.status}
                    </span>
                </div>
                <div>
                    <button onClick={() => setIsChangePasswordOpen(true)} className="bg-[#1a3aff] text-white px-4 py-2 rounded-lg cursor-pointer hover:shadow-md hover:shadow-[#1a3aff]/50 hover:bg-[#1a3aff]/80 transition-all duration-200">Change Password</button>
                </div>
                </div>

            </div>

            <div>
                {isChangePasswordOpen && (
                    <ChangePassword
                        userId={session?.user?.id}
                        onClose={() => setIsChangePasswordOpen(false)}
                    />
                )}
            </div>

            {/* Attendance quick stats */}
            {attendances.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { key: 'present',  label: 'Present',  color: '#22c55e', bg: 'rgba(34,197,94,0.10)'  },
                        { key: 'absent',   label: 'Absent',   color: '#ef4444', bg: 'rgba(239,68,68,0.10)'  },
                        { key: 'half_day', label: 'Half Day', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
                        { key: 'wfh',      label: 'WFH',      color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
                    ].map(s => (
                        <div key={s.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                            style={{ borderLeft: `3px solid ${s.color}` }}>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                            <p className="text-3xl font-bold" style={{ color: s.color }}>{attendanceCounts[s.key] ?? 0}</p>
                            <p className="text-xs text-gray-400 mt-1">last {attendances.length} days</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-6">

                    {/* Personal Information */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                                <p className="text-base font-medium text-gray-900">{session?.user?.email}</p>
                            </div>
                            {intern?.college && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">College / University</p>
                                    <p className="text-base font-medium text-gray-900">{intern.college}</p>
                                </div>
                            )}
                            {intern?.city && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">City</p>
                                    <p className="text-base font-medium text-gray-900">{intern.city}</p>
                                </div>
                            )}
                            {intern?.cgpa && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CGPA</p>
                                    <p className="text-base font-medium text-gray-900">{intern.cgpa}</p>
                                </div>
                            )}
                            {intern?.start_date && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Internship Period</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {new Date(intern.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        {intern.end_date && ` → ${new Date(intern.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department Details */}
                    {intern?.department && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Department Details</h2>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                                    <p className="text-base font-medium text-gray-900">{intern.department.name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Evaluations */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Evaluations</h2>
                        {evaluations.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {evaluations.map((evalItem, index) => (
                                    <div key={evalItem.id ?? index} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-gray-800">{evalItem.period}</span>
                                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                                                <span className="text-sm font-bold text-[#1a3aff]">{evalItem.score ?? evalItem.overall_score}</span>
                                                <span className="text-xs text-gray-500">/10</span>
                                            </div>
                                        </div>
                                        {evalItem.feedback && (
                                            <p className="text-sm text-gray-600 italic">"{evalItem.feedback}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center h-32">
                                <p className="text-sm text-gray-500">No evaluations available yet.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default InternDashboard