import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../auth/firebase";
import { useNavigate } from "react-router-dom";
import "../css/landing.css";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [request, setRequest] = useState("Login");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleSignup = async () => {
    if (password !== confirmpassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created successfully");
    } catch (error) {
      setMessage("Signup failed. Please try again.");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (request === "Login") {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  const toggleRequest = () => {
    if (request === "Login") {
      setRequest("Signup");
    } else {
      setRequest("Login");
    }
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  return (
    <div className="landing">
      <div className="form">
        <header>{request}</header>
        <span id="alert">{message}</span>
        <div className="formarea">
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {request === "Signup" && (
              <div>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmpassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
            <input type="submit" className="button" value={request} />
          </form>
        </div>
        <div className="toggle-request">
          {request === "Login" ? (
            <span>
              Don&rsquo;t have an account?
              <button onClick={toggleRequest}>Signup</button>
            </span>
          ) : (
            <span>
              Already have an account?
              <button onClick={toggleRequest}>Login</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
