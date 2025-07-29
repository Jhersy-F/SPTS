"use client";

import React from "react";

import AuthForm from "../shared/AuthForm";
import { signInWithCredentials } from "../actions/auth.actions";
import { SignUpSchema } from "@/lib/validations";

const SignUp = () => {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ username: "", password: "" }}
      onSubmit={signInWithCredentials}
    />
  );
};

export default SignUp;