import React from 'react';
import { Trash2, User } from 'lucide-react';
import { Message } from '../types/story';

interface GuestRepliesProps {
  message: Message;
  onDeleteReply?: (messageId: string, replyIndex: number) => void;
  isAdmin?: boolean;
}

export default function GuestReplies({ message, onDeleteReply, isAdmin = false }: GuestRepliesProps) {
  if (!message.guestReplies || message.guestReplies.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-gray-700 pt-3">
      <h4 className="text-sm font-medium text-gray-300 mb-2">
        Guest Replies ({message.guestReplies.length})
      </h4>
      <div className="space-y-3">
        {message.guestReplies.map((reply, index) => (
          <div key={reply._id || index} className="bg-gray-700 rounded-md p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {reply.guestPicture ? (
                    <img
                      src={reply.guestPicture}
                      alt={reply.guestName}
                      className="h-6 w-6 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ${reply.guestPicture ? 'hidden' : ''}`}>
                    <User size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-400">{reply.guestName}</span>
                  <span className="text-xs text-gray-500">({reply.guestEmail})</span>
                  <span className="text-xs text-gray-500">
                    {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{reply.content}</p>
                
                {/* Nested Replies */}
                {reply.replies && reply.replies.length > 0 && (
                  <div className="mt-3 ml-4 border-l-2 border-blue-500 pl-3">
                    <h5 className="text-xs font-medium text-blue-300 mb-2">Replies ({reply.replies.length})</h5>
                    <div className="space-y-2">
                      {reply.replies.map((nestedReply, nestedIndex) => (
                        <div key={nestedReply._id || nestedIndex} className="bg-gray-600 rounded-md p-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {nestedReply.guestPicture ? (
                                  <img
                                    src={nestedReply.guestPicture}
                                    alt={nestedReply.guestName}
                                    className="h-5 w-5 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`h-5 w-5 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center ${nestedReply.guestPicture ? 'hidden' : ''}`}>
                                  <User size={10} className="text-white" />
                                </div>
                                <span className="text-xs font-medium text-blue-300">{nestedReply.guestName}</span>
                                <span className="text-xs text-gray-500">({nestedReply.guestEmail})</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(nestedReply.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300">{nestedReply.content}</p>
                            </div>
                            {isAdmin && onDeleteReply && (
                              <button
                                onClick={() => onDeleteReply(message._id, index)}
                                className="flex-shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors duration-200"
                                title="Xóa câu trả lời"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {isAdmin && onDeleteReply && (
                <button
                  onClick={() => onDeleteReply(message._id, index)}
                  className="flex-shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors duration-200"
                  title="Xóa câu trả lời"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
