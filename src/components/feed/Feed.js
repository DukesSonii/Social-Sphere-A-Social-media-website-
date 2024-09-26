import React, { useEffect, useState } from "react";
import Follower from "../follower/Follower";
import Post from "../post/Post";
import "./Feed.scss";
import { useSelector, useDispatch } from "react-redux";
import { getFeedData } from "../../redux/slices/feedSlice";
import { FaComments, FaTimes } from "react-icons/fa";

function Feed() {
  const dispatch = useDispatch();
  const feedData = useSelector((state) => state.feedDataReducer.feedData);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({
    "Duke Soni": [
      { from: "You", text: "Hey, how's it going?" },
      { from: "Duke Soni", text: "I'm good, thanks! How about you?" },
    ],
    "John Doe": [
      { from: "John Doe", text: "Have you seen the latest movie?" },
      { from: "You", text: "Not yet! Is it good?" },
    ],
    "Jane Smith": [
      { from: "You", text: "Do you want to grab lunch tomorrow?" },
      { from: "Jane Smith", text: "Sure! What time?" },
    ],
  });
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    dispatch(getFeedData());
  }, [dispatch]);
  //feed.data mai 3 cheeza chaiye user ke posts jo recommend ho rhi, kinkin ko follow kr rkha or suggestion kisko follow krna h
  //ye 3 mujhe feed mai milne chaiye
  const handleToggleMessages = () => {
    setShowMessages(!showMessages);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowMessages(false);
    // Reset message input for new conversation
    setNewMessage("");
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setNewMessage("");
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const updatedMessages = {
        ...messages,
        [selectedUser]: [
          ...(messages[selectedUser] || []),
          { from: "You", text: newMessage },
        ],
      };
      setMessages(updatedMessages);
      setNewMessage("");
    }
  };

  return (
    <div className="Feed">
      <div className="container">
        <div className="left-part">
          {/*feed data upar se data mil jayaga, toh iske data mai jayanga */}
          {/*saare posts ko render kr dena  */}
          {feedData?.posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>

        <div className="right-part">
          <div className="following">
            <h3 className="title">You Are Following</h3>
            {feedData?.followings?.length > 0 ? (
              feedData.followings.map((user) => (
                <Follower key={user._id} user={user} />
              ))
            ) : (
              <p>No followings yet!</p>
            )}
          </div>

          <div className="suggestions">
            <h3 className="title">Suggested For You</h3>
            {feedData?.suggestions?.length > 0 ? (
              feedData.suggestions.map((user) => (
                <Follower key={user._id} user={user} />
              ))
            ) : (
              <p>No suggestions available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="messages-bar" onClick={handleToggleMessages}>
        <FaComments className="messages-icon" />
        <span className="messages-text">Chat</span>
      </div>

      {showMessages && (
        <div className="messages-dropdown">
          <button className="close-button" onClick={handleToggleMessages}>
            <FaTimes />
          </button>
          <div className="message-users">
            {Object.keys(messages).map((user) => (
              <div
                key={user}
                className="message-user"
                onClick={() => handleUserClick(user)}
              >
                {user}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="message-modal">
          <div className="modal-header">
            <h3>Messages with {selectedUser}</h3>
            <button className="close-modal" onClick={handleCloseModal}>
              <FaTimes />
            </button>
          </div>
          <div className="modal-content">
            <div className="messages-display">
              {(messages[selectedUser] || []).map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.from === "You" ? "my-message" : "other-message"
                  }`}
                >
                  <strong>{msg.from}: </strong> {msg.text}
                </div>
              ))}
            </div>
            <div className="input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button onClick={handleSendMessage} className="send-button">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feed;
