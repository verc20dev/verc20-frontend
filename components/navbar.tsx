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

export const Navbar = () => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  return (
    <NextUINavbar maxWidth="full" position="sticky" className="px-0">
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label="menu toggle"
          className="sm:hidden"
        />
        <NavbarBrand as="li" className="max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <div className="rotate-180">
              <Logo/>
            </div>
            <p className="font-bold text-inherit">vERC-20</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
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
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
        <NavbarContent className="hidden lg:flex">
          <Dropdown>
            <DropdownTrigger>
              <Button className="p-0 pt-1 bg-transparent data-[hover=true]:bg-transparent" endContent={<DropDownIcon/>}>Community</Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem key="discord" startContent={<DiscordIcon/>} endContent={<OutSiteIcon/>}>Discord</DropdownItem>
              <DropdownItem key="twitter" startContent={<TwitterIcon/>} endContent={<OutSiteIcon/>}>Twitter</DropdownItem>
              <DropdownItem key="github" startContent={<GithubIcon/>} endContent={<OutSiteIcon/>}>Github</DropdownItem>
              <DropdownItem key="gitbook" startContent={<GitBookIcon/>} endContent={<OutSiteIcon/>}>Document</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

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
          <ThemeSwitch/>
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
            <div className="flex w-full justify-between px-5 mt-4">
              <Link
                color="foreground"
                href="https://discord.gg/4a8kWUz9"
                size="lg"
                target="_blank"
              >
                <DiscordIcon size={30}/>
              </Link>
              <Link
                color="foreground"
                href="https://discord.gg/4a8kWUz9"
                size="lg"
                target="_blank"
              >
                <TwitterIcon size={30}/>
              </Link>
              <Link
                color="foreground"
                href="https://discord.gg/4a8kWUz9"
                size="lg"
                target="_blank"
              >
                <GitBookIcon size={30}/>
              </Link>
              <Link
                color="foreground"
                href="https://discord.gg/4a8kWUz9"
                size="lg"
                target="_blank"
              >
                <GithubIcon size={30}/>
              </Link>
            </div>

          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  )
}