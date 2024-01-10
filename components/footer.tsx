import React from 'react';
import SyncStatusBar from "@/components/sync-status";
import { DiscordIcon, GitBookIcon, TwitterIcon } from "@/components/icons";
import Copyright from "@/components/copyright";
import { Link } from "@nextui-org/link";
import { siteConfig } from "@/config/site";

const Footer = () => {
  return (
    <div className="w-full backdrop-blur flex flex-col items-center px-4">
      <div className="w-full flex flex-row justify-between items-center">
        <div>
          <SyncStatusBar/>
        </div>
        <div className="flex gap-2">
          <Link color="foreground" href={siteConfig.links.docs} isExternal>
            <DiscordIcon />
          </Link>
          <Link color="foreground" href={siteConfig.links.docs} isExternal>
            <TwitterIcon/>
          </Link>
          <Link color="foreground" href={siteConfig.links.docs} isExternal>
            <GitBookIcon/>
          </Link>
        </div>
      </div>
      <div>
        <Copyright/>
      </div>
    </div>
  );
};

export default Footer;