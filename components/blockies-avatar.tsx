import { Avatar } from "@nextui-org/react";
import { blo } from "blo";

export interface BlockiesAvatarProps {
  address: string;
  className?: string;
}

export const BlockiesAvatar = (props: BlockiesAvatarProps) => {
  const { address, className } = props;

  // @ts-ignore
  const avatar = blo(address, 32);
  return (
    <Avatar
      isBordered
      className={className}
      src={avatar}
    />
  );
};