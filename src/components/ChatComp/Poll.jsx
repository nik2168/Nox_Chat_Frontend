import React, { useEffect, useState } from "react";
import { getSocket } from "../../socket";
import { UPDATE_POLL } from "../../constants/events";
import { useSelector } from "react-redux";

const Poll = ({ tempId, user, question, options, samesender, chatId }) => {
  //   const question = "What's your favorite programming language?";
  //   const options = [
  //     { content: "JavaScript", members: [1, 2, 3, 4, 5, 6, 7] },
  //     { content: "C++", members: [1, 2, 3, 4] },
  //   ];
    const { allMessages } = useSelector((state) => state.chat);

  const [selectedOption, setSelectedOption] = useState("");
  const [votes, setVotes] = useState(Array(options?.length).fill(0));
  const [submitted, setSubmitted] = useState(false);

  const socket = getSocket();

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);

    socket.emit(UPDATE_POLL, {
      tempId,
      optionId: e.target.value,
      userId: user?._id,
      chatId,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const optionIndex = options.indexOf(selectedOption);
    if (optionIndex !== -1) {
      const newVotes = [...votes];
      newVotes[optionIndex] += 1;
      setVotes(newVotes);
      setSubmitted(true);
    }
  };

  let totalVotes = 0;
  let highestVote = 0;
  const maxWidth = 13;
  options?.map((i) => {
    totalVotes += i?.members?.length;
    if (i?.members?.length > highestVote) {
      highestVote = i?.members?.length;
    }
  });

  useEffect(() => {
    options?.map((i, index) => {
      if (i?.members.includes(user._id.toString())) {
        setSelectedOption(i?._id);
      }
    });
  }, [allMessages, options]);

  return !samesender ? (
    <div className="textsinboxOuterDiv">
      <div className="textsinboxdiv">
        <h2 className="textsinboxp" style={{ fontWeight: "800" }}>
          {question}
        </h2>
        <form className="optionsDiv" onSubmit={handleSubmit}>
          {options?.map((option, index) => {
            const percentage = (option?.members?.length / highestVote) * 100;
            const pixel = maxWidth * (percentage / 100);
            return (
              <div key={index} className="optionDiv">
                <label className="checkboxDiv" style={{ color: "black" }}>
                  <input
                    className="textsinboxp"
                    type="checkbox"
                    value={option?._id}
                    checked={selectedOption === option?._id}
                    onChange={(e) => handleOptionChange(e)}
                    disabled={submitted}
                  />
                  <p className="option">{option?.content}</p>
                </label>
                <div className="optionBarFill">
                  <div
                    className="optionBarEmpty"
                    style={{
                      width: `${pixel}rem`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
          {/* <button type="submit" disabled={submitted || !selectedOption}>
            {submitted ? "Submitted" : "Vote"}
          </button> */}
        </form>
        {submitted && (
          <div style={{ marginTop: "20px" }}>
            <h3>Results:</h3>
            {options?.map((option, index) => (
              <div key={index}>
                {option}: {votes[index]} vote{votes[index] !== 1 ? "s" : ""}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="textssentOuterDiv">
      <div className="textssentdiv">
        <h2 className="textssentp" style={{ fontWeight: "800" }}>
          {question}
        </h2>
        <form className="optionsDiv" onSubmit={handleSubmit}>
          {options?.map((option, index) => {
            const percentage = (option?.members?.length / highestVote) * 100;
            const pixel = maxWidth * (percentage / 100);

            return (
              <div key={index} className="optionDiv">
                <label className="checkboxDiv">
                  <input
                    type="checkbox"
                    value={option?._id}
                    checked={selectedOption === option?._id}
                    onChange={(e) => handleOptionChange(e)}
                    disabled={submitted}
                  />
                  <p className="option">{option?.content}</p>
                </label>
                <div className="optionBarFill">
                  <div
                    className="optionBarEmpty"
                    style={{ width: `${pixel}rem` }}
                  ></div>
                </div>
              </div>
            );
          })}
          {/* <button type="submit" disabled={submitted || !selectedOption}>
            {submitted ? "Submitted" : "Vote"}
          </button> */}
        </form>
        {/* {submitted && (
          <div style={{ marginTop: "20px" }}>
            <h3>Results:</h3>
            {options?.map((option, index) => (
              <div key={index}>
                {option}: {votes[index]} vote{votes[index] !== 1 ? "s" : ""}
              </div>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};

// Example usage
// const PollApp = () => {
//   const question = "What's your favorite programming language?";
//   const options = ["JavaScript", "Python", "Java", "C++"];

//   return <Poll question={question} options={options} />;
// };

export default Poll;
