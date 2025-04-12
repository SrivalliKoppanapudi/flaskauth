import React, { useContext , useState} from "react";
import { Link } from "react-router-dom";
import { DisasterContext } from "../DisasterContext";
import { FaUserCircle, FaMicrophone } from "react-icons/fa";

let recognition = null; // Global recognition instance
export default function LandingPage() {
  const { email, logOutUser, onSubmitHandler,message,setMessage } = useContext(DisasterContext);
  let isLoggedIn = email !== "";

  const [isListening, setIsListening] = useState(false);

  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    if (!recognition) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let speechText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          speechText += event.results[i][0].transcript + " ";
        }
        setMessage(speechText.trim());
      };

      recognition.onerror = (event) => console.error("Speech recognition error:", event);
      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false); // Ensure UI updates when stopped
      };
    }

    if (isListening) {
      recognition.stop(); // Stop if already listening
      console.log("Stopped listening");
      onSubmitHandler();
    } else {
      recognition.start(); // Start if not listening
      console.log("Listening...");
    }

    setIsListening(!isListening); // Toggle state


  
  }


  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      background: "linear-gradient(180deg, rgb(28, 43, 109), rgb(75, 83, 117))",
      color: "white",
      fontFamily: "'Arial', sans-serif",
      margin: 0,
      padding: "20px", // Padding for better spacing on smaller screens
    },
    overlay: {
      position: "relative",
      background: "rgba(39, 38, 38, 0.6)",
      padding: "50px",
      borderRadius: "10px",
      boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
      width: "90%",
      maxWidth: "600px", // Limits width on larger screens
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      textShadow: "3px 3px 6px rgba(0, 0, 0, 0.5)",
      marginBottom: "15px",
    },
    text: {
      fontSize: "1rem",
      marginBottom: "15px",
    },
    button: {
      padding: "8px 20px",
      fontSize: "1rem",
      borderRadius: "10px",
      textDecoration: "none",
      margin: "5px",
      transition: "all 0.3s ease-in-out",
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.3)",
      backgroundColor: "white",
      color: "black",
      border: "none",
      cursor: "pointer",
    },
    userNav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginBottom: "15px",
    },
    userIcon: {
      fontSize: "2.5rem",
      color: "white",
      cursor: "pointer",
    },
    msgInputContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.8rem",
      flexWrap: "wrap",
      width: "100%",
    },
    msgInput: {
      border: "none",
      outline: "none",
      padding: "8px",
      width: "80%",
      maxWidth: "300px",
      borderRadius: "5px",
      textAlign: "center",
    },
    btnMsg: {
      padding: "8px 15px",
      outline: "none",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "1rem",
    },
    linkContainer: {
      display: "flex",
      justifyContent:"space-between",
      alignItems: "center",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        {isLoggedIn ? (
          <div style={styles.userNav}>
            <FaUserCircle style={styles.userIcon} title="User Profile" />
            <button onClick={logOutUser} style={styles.button}>
              Logout
            </button>
          </div>
        ) : null}

        <h1 style={styles.title}>Disaster Response Management </h1>
        <p style={styles.text}>
          Stay informed and take action during emergencies. Join us in making
          communities safer.
        </p>

        {isLoggedIn && (
          <div style={styles.msgInputContainer}>
            <input type="text" style={styles.msgInput} placeholder="Enter message" value={message} // Controlled input
            onChange={(e) => setMessage(e.target.value)} />
            {/* <FaMicrophone size={20} color="white" style={{ cursor: "pointer" }} /> */}
            <div style={{ backgroundColor: "white", padding: "8px", borderRadius: "50%" }} onClick={toggleSpeechRecognition}>
      {/* <FaMicrophone style={{ color: "black", fontSize: "24px" }} /> */}
      <FaMicrophone style={{ color: isListening ? "red" : "black", fontSize: "24px" }} />
    </div>
            <button style={styles.btnMsg} onClick={onSubmitHandler}>
              Submit
            </button>
          </div>
        )}

        {!isLoggedIn && (
          <div style={styles.linkContainer}>
            <Link to="/login" style={styles.button}>
              Login
            </Link>
            <Link to="/register" style={styles.button}>
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
