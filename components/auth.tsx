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
    <Box className="flex flex-col items-center justify-center gap-1">
      {isLoggedIn && (
        <>
          <Text className="text-xs text-main-white text-center">
            Hi, {(user as any).displayName}
          </Text>
          <Link
            className="text-lg text-main-white border rounded-full border-main-white border-solid py-1 px-4"
            onClick={() => auth.signOut()}
          >
            Logout
          </Link>
        </>
      )}
      {!isLoggedIn && (
        <Button
          className="text-lg text-main-white border rounded-full border-main-white border-solid py-1 px-4"
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
