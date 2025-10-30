import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { AppDispatch, RootState } from '@/state/store'
import { convertLeadToClient, selectEntityById } from '@/state/entitiesSlice'
import { selectRetentionAgents } from '@/state/retentionSelectors'
import { postCommentAndUpdateEntity } from '@/features/comments/commentsSlice'

import { ArrowsCounterClockwise, X, User } from '@phosphor-icons/react'

interface ConvertLeadDialogProps {
  open: boolean
  onClose: () => void
  leadId: string
}

export default function ConvertLeadDialog({ open, onClose, leadId }: ConvertLeadDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  
  const [retentionOwnerId, setRetentionOwnerId] = useState('')
  const [commentText, setCommentText] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const lead = useSelector(selectEntityById(leadId))
  const retentionAgents = useSelector(selectRetentionAgents)
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setRetentionOwnerId('')
      setCommentText('')
      setError(null)
      setSearchQuery('')
      setDropdownOpen(false)
    }
  }, [open])
  
  // Filter agents based on search query
  const filteredAgents = retentionAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.team && agent.team.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  const handleConvert = async () => {
    if (!retentionOwnerId) {
      setError('Retention Owner is required')
      return
    }
    
    if (!lead) {
      setError('Lead not found')
      return
    }
    
    setIsConverting(true)
    setError(null)
    
    try {
      console.log(`🚀 Starting lead conversion:`, {
        leadId,
        retentionOwnerId,
        commentText
      })
      
      // Convert lead to client
      const result = await dispatch(convertLeadToClient({ id: leadId, retentionOwnerId, commentText })).unwrap()
      console.log(`✅ Lead conversion successful:`, result)
      
      // If there's a comment, add it to the comments
      if (commentText.trim()) {
        await dispatch(postCommentAndUpdateEntity({
          entityId: leadId,
          text: commentText.trim(),
          statusApplied: 'Converted to Client'
        })).unwrap()
      }
      
      // Close dialog and navigate to client profile
      onClose()
      navigate(`/clients/${leadId}`)
    } catch (error) {
      console.error('❌ Conversion failed:', error)
      setError('Failed to convert lead. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }
  
  const fullName = lead ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : ''
  
  return (
    <>
      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            {/* Modal header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ArrowsCounterClockwise className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Convert Lead to Client
                </h3>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg text-sm p-2 inline-flex items-center transition-colors"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close modal</span>
              </button>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-6">

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
        
            {/* Lead Information */}
            <div className="mb-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-900">Lead Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-blue-700 mb-1">Full Name</span>
                    <span className="text-sm font-semibold text-gray-900">{fullName || 'Not provided'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-blue-700 mb-1">Email Address</span>
                    <span className="text-sm font-semibold text-gray-900">{lead?.email || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-blue-700 mb-1">Account ID</span>
                    <span className="text-sm font-semibold text-gray-900">{lead?.accountId || 'Not assigned'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-blue-700 mb-1">Phone Number</span>
                    <span className="text-sm font-semibold text-gray-900">{lead?.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retention Owner Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Assign Retention Owner <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
              {retentionOwnerId ? (
                (() => {
                  const selectedAgent = retentionAgents.find(agent => agent.id === retentionOwnerId);
                  return selectedAgent ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                        {selectedAgent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-gray-900">{selectedAgent.name}</span>
                    </div>
                  ) : 'Select agent...';
                })()
              ) : (
                <span className="text-gray-500">Select a retention owner...</span>
              )}
              
              <svg className={`w-4 h-4 text-gray-400 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {/* Search Bar */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 pl-9 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
                        autoFocus
                      />
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Agent List */}
                  <div className="max-h-64 overflow-auto">
                    {filteredAgents.length > 0 ? (
                      filteredAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => {
                            setRetentionOwnerId(agent.id);
                            setDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                              {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              agent.online ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.team} Team</p>
                          </div>
                          
                          <span className={`text-xs px-2 py-1 rounded ${
                            agent.online 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {agent.online ? 'Online' : 'Offline'}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-gray-500">
                        No agents found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

            {/* Comment Field */}
            <div className="mb-6">
              <label htmlFor="comment" className="block mb-3 text-sm font-semibold text-gray-900">
                Add Conversion Note (Optional)
              </label>
              <textarea
                id="comment"
                placeholder="Add any relevant notes about this conversion..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                className="block p-3 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                disabled={isConverting}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleConvert}
                disabled={!retentionOwnerId || isConverting || !lead}
                className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
              >
                {isConverting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Converting Lead...
                  </>
                ) : (
                  <>
                    <ArrowsCounterClockwise size={16} />
                    Convert to Client
                  </>
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  )
}
