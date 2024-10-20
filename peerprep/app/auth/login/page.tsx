"use client";
import React from "react";
import style from "@/style/form.module.css";
import { useFormState, useFormStatus } from "react-dom";
import FormTextInput from "@/components/shared/form/FormTextInput";
import FormPasswordInput from "@/components/shared/form/FormPasswordInput";
import { login } from "@/app/actions/server_actions";
import Link from "next/link";

type Props = {};

function LoginPage({}: Props) {
  const [state, action] = useFormState(login, undefined);
  // we can actually use server actions to auth the user... maybe we can
  // change our AddQn action too.
  return (
    <div className={style.wrapper}>
      <form className={style.form_container} action={action}>
        <h1 className={style.title}>Welcome to PeerPrep!</h1>

        <FormTextInput required label="Email:" name="email" />

        {state?.errors?.email && (
          <p className={style.error}>{state.errors.email}</p>
        )}

        <FormPasswordInput required label="Password:" name="password" />

        {state?.errors?.password && (
          <div className={style.error}>
            <p>Password must:</p>
            <ul>
              {state.errors.password.map((error) => (
                <li key={error}>- {error}</li>
              ))}
            </ul>
          </div>
        )}

        <SubmitButton />
        <p>
          No account?{" "}
          <Link className={"font-bold hover:underline"} href="/auth/register">
            Register here.
          </Link>
        </p>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      // bg-blue-500 hover:bg-blue-600 text-white font-bold py-1
      className={`      bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded
      `}
      disabled={pending}
      type="submit"
    >
      Login
    </button>
  );
}

export default LoginPage;
