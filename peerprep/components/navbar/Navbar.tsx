import Link from "next/link";
import React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { ProfileDropdown } from "@/components/navbar/ProfileDropdown";

// Navbar adapted from https://tailwindui.com/components/application-ui/navigation/navbars

interface NavbarItemProps {
  href: string;
  name: string;
}

const navigation: NavbarItemProps[] = [
  { href: "/", name: "Home" },
  { href: "/questions", name: "Questions" },
  // { href: "/auth/login", name: "Login" },
];

const MobileMenu = () => {
  return (
    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
      {/* Mobile menu button*/}
      <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
        <span className="absolute -inset-0.5" />
        <span className="sr-only">Open main menu</span>
        <Menu
          aria-hidden="true"
          className="block h-6 w-6 group-data-[open]:hidden"
        />
        <X
          aria-hidden="true"
          className="hidden h-6 w-6 group-data-[open]:block"
        />
      </DisclosureButton>
    </div>
  );
};

const MobileDropdown = () => {
  return (
    <DisclosurePanel className="sm:hidden">
      <div className="space-y-1 px-2 pb-3 pt-2">
        {navigation.map((item) => (
          <DisclosureButton
            key={item.name}
            as="a"
            href={item.href}
            className={
              "block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            }
          >
            {item.name}
          </DisclosureButton>
        ))}
      </div>
    </DisclosurePanel>
  );
};

const NavigationList = () => {
  return (
    <div className="hidden sm:ml-6 sm:block">
      <div className="flex space-x-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={
              "rounded-md px-3 py-2 text-lg font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            }
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

const Navbar = () => {
  return (
    <Disclosure as="nav" className="mb-5 bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <MobileMenu />
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Link href={"/"}>
                <Image
                  alt="Peerprep"
                  src="/icon.png"
                  className="h-8 w-auto"
                  height={32}
                  width={32}
                />
              </Link>
            </div>
            <NavigationList />
          </div>
          <ProfileDropdown />
        </div>
      </div>
      <MobileDropdown />
    </Disclosure>
  );
};

export default Navbar;
