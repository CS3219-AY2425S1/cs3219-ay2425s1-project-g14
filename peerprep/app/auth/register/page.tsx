"use client";
import React from "react";
import style from "@/style/form.module.css";
import { useFormState, useFormStatus } from "react-dom";
import FormTextInput from "@/components/shared/form/FormTextInput";
import { signup } from "@/app/actions/server_actions";
import Link from "next/link";

function RegisterPage() {
  const [state, action] = useFormState(signup, undefined);
  return (
    // we can actually use server actions to auth the user... maybe we can
    // change our AddQn action too.
    <div className={style.wrapper}>
      <form className={style.form_container} action={action}>
        <h1 className={style.title}>Sign up for an account</h1>
        <FormTextInput required label="Username:" name="username" />
        {state?.errors?.username && (
          <p className={style.error}>{state.errors.username}</p>
        )}
        <FormTextInput required label="Email:" name="email" />
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
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className={"font-bold hover:underline"}>
            Login here.
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
      disabled={pending}
      type="submit"
      className={`rounded bg-blue-500 px-4 py-1 font-bold text-white hover:bg-blue-600`}
    >
      Sign up
    </button>
  );
}

export default RegisterPage;
