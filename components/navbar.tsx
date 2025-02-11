"use client";

import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Image
} from "@nextui-org/react";
import NextLink from "next/link";
import { CustomConnectBtn } from "@/components/connect-button";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import {
  DiscordIcon,
  DropDownIcon, GitBookIcon, GithubIcon,
  Logo,
  OutSiteIcon,
  SearchIcon, TwitterIcon
} from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import clsx from "clsx";
import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { useRouter } from "next/navigation";
import useScreenSize from "@/hook/screen-size";

export const Navbar = () => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const screenSize = useScreenSize();

  return (
    <div>
      <NextUINavbar maxWidth="full" position="sticky" className="px-0">
        <NavbarContent justify="start">
          <NavbarMenuToggle
            aria-label="menu toggle"
            className="lg:hidden"
          />
          <NavbarBrand as="li" className="max-w-fit">
            <NextLink className="flex justify-start items-center gap-1" href="/">
              <Logo
                size={screenSize.width > 768 ? 36 : 24}
              />
              <p className="font-bold text-inherit">vERC-20</p>
            </NextLink>
          </NavbarBrand>
          <div className="hidden lg:flex gap-4 justify-start ml-2">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    linkStyles({color: "foreground"}),
                    "data-[active=true]:text-primary data-[active=true]:font-medium"
                  )}
                  color="foreground"
                  href={item.href}
                >
                  <p className="font-bold">{item.label}</p>
                </NextLink>
              </NavbarItem>
            ))}
          </div>

        </NavbarContent>

        <NavbarContent className="hidden lg:flex lg:w-1/4" justify="center">
          <NavbarItem className="flex w-full">
            <Input
              aria-label="Search"
              classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm",
              }}
              labelPlacement="outside"
              placeholder="Search address for vERC-20 balance..."
              startContent={
                <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0"/>
              }
              type="search"
              value={searchValue}
              onValueChange={setSearchValue}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchValue !== "") {
                  router.push(`/address/${searchValue}`)
                }
              }}
            />
          </NavbarItem>
        </NavbarContent>

        <NavbarContent className="flex right-0" justify="end">
          <NavbarItem className="flex gap-1">
            <CustomConnectBtn/>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          <Input
            aria-label="Search"
            classNames={{
              inputWrapper: "bg-default-100",
              input: "text-sm",
            }}
            labelPlacement="outside"
            placeholder="Search address for vERC-20 balance..."
            startContent={
              <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0"/>
            }
            type="search"
          />
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color="foreground"
                  href={item.href}
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
            <Divider/>
            <NavbarMenuItem>
              <div className="flex w-full justify-center px-5 mt-4">
                <div className="flex flex-row gap-8">
                  <Link
                    color="foreground"
                    href={siteConfig.links.discord}
                    size="lg"
                    target="_blank"
                  >
                    <DiscordIcon size={30}/>
                  </Link>
                  <Link
                    color="foreground"
                    href={siteConfig.links.twitter}
                    size="lg"
                    target="_blank"
                  >
                    <TwitterIcon size={30}/>
                  </Link>
                  <Link
                    color="foreground"
                    href={siteConfig.links.docs}
                    size="lg"
                    target="_blank"
                  >
                    <GitBookIcon size={30}/>
                  </Link>
                </div>

              </div>

            </NavbarMenuItem>
          </div>
        </NavbarMenu>
      </NextUINavbar>
      <Divider/>
    </div>

  )
}