import React from "react";
import {Box, Button, Link, Text} from "@chakra-ui/react";
import {signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import {FaGoogle} from "react-icons/fa";
import {auth} from "../firebase";
import useAuth from "../hooks/useAuth";

const Auth = () => {
  const {isLoggedIn, user} = useAuth();

  const handleAuth = async () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);

        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result?.user;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  return (
    <Box>
      {isLoggedIn && (
        <>
          <Text style={{fontSize: ".5em"}}>
            Hi, {(user as any).displayName}
          </Text>
          <Link
            style={{
              border: "1px solid var(--main-black)",
              padding: ".25em .75em",
              borderRadius: "999em",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: ".6em",
            }}
            onClick={() => auth.signOut()}
          >
            Logout
          </Link>
        </>
      )}
      {!isLoggedIn && (
        <Button
          style={{
            color: "var(--dark-green)",
            background: "none",
            border: "1px solid var(--main-black)",
            borderRadius: "999em",
            padding: ".25em .75em",
            fontFamily: "dico-sans-soft",
            fontWeight: "400",
            fontStyle: "normal",
          }}
          leftIcon={<FaGoogle />}
          onClick={() => handleAuth()}
        >
          SignIn
        </Button>
      )}
    </Box>
  );
};

export default Auth;
