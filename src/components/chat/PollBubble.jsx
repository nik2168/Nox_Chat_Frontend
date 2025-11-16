import React, { useEffect, useState } from "react";
import { getSocket } from "../../socket";
import { UPDATE_POLL } from "../../constants/events";
import { useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Poll Bubble Component (iMessage style)
 * Displays polls in messages with iMessage-style UI
 */
const PollBubble = ({ tempId, user, question, options, isMyMessage, chatId }) => {
  const { isDark } = useTheme();
  const { allMessages } = useSelector((state) => state.chat);
  const [selectedOption, setSelectedOption] = useState(null);
  const socket = getSocket();

  // Calculate total votes
  const totalVotes = options?.reduce((sum, opt) => sum + (opt.members?.length || 0), 0) || 0;

  // Find which option the user has voted for
  useEffect(() => {
    for (let i = 0; i < options?.length; i++) {
      const hasVoted = options[i]?.members?.some(
        (m) => m._id?.toString() === user._id.toString()
      );
      if (hasVoted) {
        setSelectedOption(i);
        break;
      }
    }
  }, [allMessages, options, user._id]);

  const handleOptionClick = (optionIdx) => {
    setSelectedOption(optionIdx);
    socket.emit(UPDATE_POLL, {
      tempId,
      optionIdx,
      userId: user?._id,
      userData: user,
      chatId,
    });
  };

  if (isMyMessage) {
    // Sent message - blue bubble
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[70%] lg:max-w-[60%]">
          <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
            {/* Question */}
            <h3 className="text-[15px] font-semibold mb-1">{question}</h3>
            
            {/* Vote count */}
            {totalVotes > 0 && (
              <p className="text-xs text-white/70 mb-3">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</p>
            )}

            {/* Options */}
            <div className="space-y-2">
              {options?.map((option, index) => {
                const votes = option.members?.length || 0;
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                const isSelected = selectedOption === index;
                const hasVoted = option.members?.some(
                  (m) => m._id?.toString() === user._id.toString()
                );

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    className="w-full text-left relative overflow-hidden rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                  >
                    {/* Progress bar */}
                    {percentage > 0 && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-xl"
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    
                    {/* Content */}
                    <div className="relative px-3 py-2.5 flex items-center justify-between">
                      <span className={`text-[15px] flex-1 ${
                        isSelected || hasVoted ? 'font-semibold' : 'font-normal'
                      } text-white`}>
                        {option.content}
                      </span>
                      
                      {/* Vote count and avatars */}
                      {votes > 0 && (
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-white/70">{votes}</span>
                          <div className="flex -space-x-1">
                            {option.members?.slice(0, 3).map((member, idx) => {
                              const avatarUrl = member?.avatar?.url || member?.avatar || member?.userData?.avatar?.url || member?.userData?.avatar || "/avatar.jpeg";
                              const memberName = member?.name || member?.userData?.name || "User";
                              return (
                                <img
                                  key={idx}
                                  src={avatarUrl}
                                  alt={memberName}
                                  className="w-5 h-5 rounded-full border-2 border-blue-500 object-cover"
                                />
                              );
                            })}
                            {votes > 3 && (
                              <div className="w-5 h-5 rounded-full bg-white/20 border-2 border-blue-500 flex items-center justify-center">
                                <span className="text-[10px] text-white font-semibold">+{votes - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Received message - gray bubble
  return (
    <div className="flex flex-col items-start">
      <div className="max-w-[70%] lg:max-w-[60%]">
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } text-gray-900 dark:text-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm`}>
          {/* Question */}
          <h3 className={`text-[15px] font-semibold mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {question}
          </h3>
          
          {/* Vote count */}
          {totalVotes > 0 && (
            <p className={`text-xs mb-3 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </p>
          )}

          {/* Options */}
          <div className="space-y-2">
            {options?.map((option, index) => {
              const votes = option.members?.length || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const isSelected = selectedOption === index;
              const hasVoted = option.members?.some(
                (m) => m._id?.toString() === user._id.toString()
              );

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`w-full text-left relative overflow-hidden rounded-xl transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {/* Progress bar */}
                  {percentage > 0 && (
                    <div
                      className={`absolute left-0 top-0 bottom-0 rounded-xl ${
                        isDark ? 'bg-blue-500/30' : 'bg-blue-500/20'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  
                  {/* Content */}
                  <div className="relative px-3 py-2.5 flex items-center justify-between">
                    <span className={`text-[15px] flex-1 ${
                      isSelected || hasVoted ? 'font-semibold' : 'font-normal'
                    } ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {option.content}
                    </span>
                    
                    {/* Vote count and avatars */}
                    {votes > 0 && (
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {votes}
                        </span>
                        <div className="flex -space-x-1">
                          {option.members?.slice(0, 3).map((member, idx) => {
                            const avatarUrl = member?.avatar?.url || member?.avatar || member?.userData?.avatar?.url || member?.userData?.avatar || "/avatar.jpeg";
                            const memberName = member?.name || member?.userData?.name || "User";
                            return (
                              <img
                                key={idx}
                                src={avatarUrl}
                                alt={memberName}
                                className={`w-5 h-5 rounded-full border-2 object-cover ${
                                  isDark ? 'border-gray-700' : 'border-white'
                                }`}
                              />
                            );
                          })}
                          {votes > 3 && (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isDark 
                                ? 'bg-gray-600 border-gray-700' 
                                : 'bg-gray-300 border-white'
                            }`}>
                              <span className={`text-[10px] font-semibold ${
                                isDark ? 'text-white' : 'text-gray-700'
                              }`}>
                                +{votes - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollBubble;

