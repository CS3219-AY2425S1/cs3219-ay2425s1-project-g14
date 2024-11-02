"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "next/image";
import React from "react";
import Link from "next/link";

export const ProfileDropdown = () => {
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
          <MenuItem>
            <Link
              href="#"
              className="block px-4 py-2 text-sm data-[focus]:bg-gray-2"
            >
              Your Profile (Coming Soon)
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              href="#"
              className="block px-4 py-2 text-sm data-[focus]:bg-gray-2"
            >
              Settings (Coming Soon)
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              href="/api/internal/auth/expire"
              className="block px-4 py-2 text-sm data-[focus]:bg-gray-2"
            >
              Sign out
            </Link>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
};
