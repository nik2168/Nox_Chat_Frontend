import React, { useState } from "react";
import { Close, Add, Delete } from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Poll Creation Modal (iMessage style)
 * Opens when user clicks Poll button in ChatFilesMenu
 */
const PollModal = ({ isOpen, onClose, onSubmit }) => {
  const { isDark } = useTheme();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (!question.trim() || validOptions.length < 2) {
      return;
    }
    onSubmit({
      question: question.trim(),
      options: validOptions.map(opt => ({ content: opt.trim(), members: [] })),
    });
    setQuestion("");
    setOptions(["", ""]);
    onClose();
  };

  const handleClose = () => {
    setQuestion("");
    setOptions(["", ""]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div 
        className={`w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            New Poll
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Close />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {/* Question */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                isDark
                  ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Ask a question..."
              required
            />
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Options
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={`Option ${index + 1}`}
                    required={index < 2}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? 'hover:bg-gray-800 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-blue-400 hover:bg-gray-800'
                    : 'text-blue-500 hover:bg-gray-50'
                }`}
              >
                <Add className="w-5 h-5" />
                <span className="text-sm font-medium">Add Option</span>
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className={`p-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!question.trim() || options.filter(opt => opt.trim() !== "").length < 2}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              question.trim() && options.filter(opt => opt.trim() !== "").length >= 2
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollModal;

