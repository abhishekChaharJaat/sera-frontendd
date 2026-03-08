"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ModalBase from "@/components/ModalBase";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setSignIn, setSignUp } from "@/store/modalSlice";
import "./auth.css";

const Signin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const isOpen = useSelector((state: RootState) => state.modal.isSignInOpen);

  useEffect(() => {
    const storeTokenAndRedirect = async () => {
      if (isSignedIn && isOpen) {
        const token = await getToken();
        if (token) {
          localStorage.setItem("authToken", token);
        }
        dispatch(setSignIn(false));
        router.push("/home");
      }
    };
    storeTokenAndRedirect();
  }, [isSignedIn, isOpen, dispatch, router, getToken]);

  if (!isOpen) return null;

  return (
    <ModalBase onClose={() => dispatch(setSignIn(false))}>
      <div className="px-4 py-6 md:px-20 md:py-10">
        <SignIn
          routing="hash"
          forceRedirectUrl="/home"
          signUpForceRedirectUrl="/home"
        />
        <p className="mt-4 text-center text-sm text-white/40">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => dispatch(setSignUp(true))}
            className="text-[#19c37d] hover:underline font-medium cursor-pointer"
          >
            Sign Up
          </button>
        </p>
      </div>
    </ModalBase>
  );
};

export default Signin;
