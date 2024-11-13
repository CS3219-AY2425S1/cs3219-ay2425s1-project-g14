import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { UserData } from "@/api/structs";
import { hydrateUid } from "@/app/actions/server_actions";

export const ProfileDropdown = async () => {
  let userData;
  try {
    userData = (await hydrateUid()) as UserData;
  } catch {
    userData = null;
    console.error("Error hydrating user data.");
  }

  return (
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
      {/* Profile dropdown */}
      <Menu as="div" className="relative ml-3">
        <div>
          <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <Image
              alt="Profile Picture"
              src="/person.png"
              className="h-8 w-8 rounded-full bg-white"
              height={32}
              width={32}
            />
          </MenuButton>
        </div>
        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-1 py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          {userData ? (
            <>
              <MenuItem>
                <div className="block px-4 py-2 text-sm text-white data-[focus]:bg-gray-2">
                  Hello, {userData.username}!
                </div>
              </MenuItem>
              <MenuItem>
                <Link
                  href="/auth/logout"
                  className="block px-4 py-2 text-sm data-[focus]:bg-gray-2"
                >
                  Sign out
                </Link>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-sm data-[focus]:bg-gray-2"
                >
                  Login
                </Link>
              </MenuItem>
            </>
          )}
        </MenuItems>
      </Menu>
    </div>
  );
};
