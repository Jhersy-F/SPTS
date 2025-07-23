"use client";

import React from "react";

import AuthForm from "../shared/AuthForm";
import { signInWithCredentials } from "../actions/auth.actions";
import { SignInSchema } from "@/lib/validations";

const SignIn = () => {
  return (
    <AuthForm
      formType="SIGN_IN"
      schema={SignInSchema}
      defaultValues={{ username: "", password: "" }}
      onSubmit={signInWithCredentials}
    />
  );
};

export default SignIn;