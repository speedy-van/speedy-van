"use client";
import NextLink from "next/link";
import { Button, ButtonProps } from "@chakra-ui/react";

type Props = ButtonProps & { href: string; label: string; };

export default function HeaderButton({ href, label, ...rest }: Props) {
  return (
    <Button
      as={NextLink}
      href={href}
      variant="headerCta"
      aria-label={label}
      {...rest}
    >
      {label}
    </Button>
  );
}
