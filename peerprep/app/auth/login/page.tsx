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
  return (
    // we can actually use server actions to auth the user... maybe we can
    // change our AddQn action too.
    <div className={style.wrapper}>
      <form className={style.form_container} action={action}>
        <h1 className={style.title}>Login to PeerPrep</h1>
        <FormTextInput required label="Email:" name="email" />
        {state?.errors?.email && <p>{state.errors.email}</p>}
        <FormPasswordInput required label="Password:" name="password" />
        {state?.errors?.password && (
          <div>
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
          No account? <Link href="/auth/register">Register here.</Link>
        </p>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      Login
    </button>
  );
}

export default LoginPage;
