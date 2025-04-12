import { createContext,useState , useEffect} from "react";

import {useNavigate} from "react-router-dom"

import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

export const DisasterContext = createContext();


const DisasterContextProvider = (props)=>{

      const [email, setEmail] = useState(localStorage.getItem("email")||'');
      const [token,setToken]= useState(localStorage.getItem('token') || '')
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [message, setMessage] = useState(""); // Store message input
      const navigate = useNavigate();
      const [predictions,setPredictions] = useState([]);

    
      const registerUser = () => {
        if (email.length === 0 || password.length === 0 || confirmPassword.length === 0) {
          alert("All fields are required!");
        } else if (password !== confirmPassword) {
          alert("Passwords do not match!");
        } else {
          axios.post('http://127.0.0.1:5000/register', { email, password })
            .then(response => {
              console.log(response);
              toast.success("Registered successfully,please login")
              navigate("/login");
            })
            .catch(error => {
              console.log(error, 'error');
              alert("Registration failed!");
            });
        }
        setEmail("")
        setPassword("")
        setConfirmPassword("")
      };

      const logInUser = () => {
        if (!email) {
          alert("Email has been left blank!");
        } else if (!password) {
          alert("Password has been left blank!");
        } else {
          axios.post("http://127.0.0.1:5000/login", { email, password })
            .then(response => {
              /* console.log(response);
    
              // Store email & token only on successful login
              localStorage.setItem("email", email);
              localStorage.setItem("token", response.data.token); */
              const tokenFromServer = response.data.token; // ✅ Get token from response
        const emailFromServer = response.data.email;
        const roleFromServer = response.data.role;

        // ✅ Store token and email in localStorage
        localStorage.setItem("token", tokenFromServer);
        localStorage.setItem("email", emailFromServer);
        localStorage.setItem("role", roleFromServer);

        setEmail(emailFromServer); // Also update local state if needed
        setToken(tokenFromServer)

         // ✅ Navigate based on role
         toast.success("Login successful")
         if (roleFromServer === "admin") {
          navigate("/adminPage");
        } else {
          navigate("/");
        }
    
            })
            .catch(error => {
              console.log(error, "error");
              if (error.response && error.response.status === 401) {
                alert("Invalid credentials");
              }
            });
        }
        setEmail("")
        setPassword("")
      };
    
      useEffect(() => {
        // Check if user is already logged in (Persist login session)
        const storedEmail = localStorage.getItem("email");
        const storedToken=localStorage.getItem("token")
        const storedRole = localStorage.getItem("role");
        if (storedEmail) {
          setEmail(storedEmail);
          setToken(storedToken);
        }
      }, []);


      const logOutUser = () => {
        // Clear user state
        setEmail("");
        setToken("")
        // Remove email & token from localStorage
        localStorage.removeItem("email");
        localStorage.removeItem("token");
      
        // Redirect to login page
        
        navigate("/login");
      };
      

        const onSubmitHandler = () =>{
          console.log("submitted")
          if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
          }
      
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              // setLocation({ latitude, longitude });
      
              // Send data to Flask backend
              fetch("http://127.0.0.1:5000/submitLocation", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ email, latitude, longitude,message }),
              })
                // .then((response) => {console.log(response);response.json()})
                .then((response) => {
                  console.log(response);
                  return response.json(); // ✅ return the JSON promise
                })
                // .then((data) => alert(`Location sent: ${data.message}`))
                .then((data) => {
                  console.log("📦 Data from backend:", data); // 🔍 log full data
                  alert(`Location sent: ${data.message}`);
                  // If you want to use predicted_categories:
                  
                  setPredictions(data.predicted_categories)
                  console.log("Predicted Categories:", data.predicted_categories);
                  navigate('/dashboard')
                  // You can also store it in state or display it in the UI
                })
                // .catch((error) => alert("Error sending location"));
                .catch((error) => {
                  console.error("❌ Error:", error);
                  alert("Error sending location");
                });
            },
            (error) => {
              alert("Unable to retrieve location: " + error.message);
            }
          );
          setMessage("")
        }

        const value = {
          onSubmitHandler,message,setMessage,token,setToken,predictions,setPredictions,
          logInUser,registerUser,password,setPassword,confirmPassword,setConfirmPassword,email,setEmail,logOutUser,navigate
        }

        return (
          <DisasterContext.Provider value={value}>
              {props.children}
          </DisasterContext.Provider>
      )
    

}

export default DisasterContextProvider;