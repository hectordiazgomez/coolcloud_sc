import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Loader2 } from 'lucide-react';
import { query, where } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import Home from "./components/home";
import Dashboard from "./components/dashboard";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GithubAuthProvider();
provider.addScope('repo');


const initialOptions = {
  "client-id": "",
  currency: "USD",
  intent: "capture",
};


function App() {

  const [paid, setPaid] = useState(false)
  const [repositories, setRepositories] = useState([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoggedIn(true);
      } else {
        setUser(null);
        setLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGitHub = () => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return signInWithPopup(auth, provider);
      })
      .then((result) => {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const signedInUser = result.user;
        setUser(signedInUser);
        console.log("User signed in:", signedInUser);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error during sign-in:", errorCode, errorMessage);
      });
  };

  const elementsRef = collection(db, "deployments");
  const [loadingS3, setLoadingS3] = useState(false)

  const [retrievedDeployments, setRetrievedDeployments] = useState([]);
  const [loadingDeployments, setLoadingDeployments] = useState(false);

  useEffect(() => {
    const fetchDeployments = async () => {
      if (user) {
        setLoadingDeployments(true);
        try {
          const deploymentsRef = collection(db, "deployments");
          const q = query(deploymentsRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const deployments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRetrievedDeployments(deployments);
          console.log("Deployments retrieved:", deployments);
        } catch (error) {
          console.error("Error fetching deployments:", error);
        } finally {
          setLoadingDeployments(false);
        }
      }
    };
    fetchDeployments();
  }, [user, db]);

  if (loading) {
   return <div className="flex py-20 justify-center items-center">
      <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
    </div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home auth={auth} provider={provider} setRepositories={setRepositories} signInWithGitHub={signInWithGitHub} setShowEmailForm={setShowEmailForm} showEmailForm={showEmailForm} setEmail={setEmail} email={email} setPassword={setPassword} password={password} showPopup={showPopup} setShowPopup={setShowPopup} user={user} loggedIn={loggedIn} />} />
        <Route path="/dashboard" element={<Dashboard setPaid={setPaid} initialOptions={initialOptions} data={retrievedDeployments} user={user} repositories={repositories} />} />
      </Routes>
    </Router>
  );
}

export default App;  
