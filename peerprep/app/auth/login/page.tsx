"use client";
import React from "react";
import style from "@/style/form.module.css";
import { useFormState, useFormStatus } from "react-dom";
import FormTextInput from "@/components/shared/form/FormTextInput";
import { login } from "@/app/actions/server_actions";
import Link from "next/link";

function LoginPage() {
  const [state, action] = useFormState(login, undefined);
  // we can actually use server actions to auth the user... maybe we can
  // change our AddQn action too.
  return (
    <div className={style.wrapper}>
      <div className={"flex flex-col content-center"}>
        <form className={style.form_container} action={action}>
          <h1 className={style.title}>Login to start using our services</h1>

          <FormTextInput
            required
            label="Email:"
            name="email"
            isPassword={false}
          />

          {state?.errors?.email && (
            <p className={style.error}>{state.errors.email}</p>
          )}

          <FormTextInput
            required
            label="Password:"
            name="password"
            isPassword={true}
          />

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
        </form>
        <p className={"flex flex-auto justify-center"}>
          No account?&nbsp;
          <Link className={"font-bold hover:underline"} href="/auth/register">
            {" "}
            Register here.
          </Link>
        </p>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      // bg-blue-500 hover:bg-blue-600 text-white font-bold py-1
      className={`rounded bg-blue-500 px-4 py-1 font-bold text-white hover:bg-blue-600`}
      disabled={pending}
      type="submit"
    >
      Login
    </button>
  );
}

export default LoginPage;
