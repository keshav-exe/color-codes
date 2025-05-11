import { FaXTwitter } from "react-icons/fa6";
import { Button } from "./ui/button";
import { FaGithub } from "react-icons/fa6";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import { Palette } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="flex sticky top-0 left-0 right-0 border-b border-dashed z-50">
      <div className="flex gap-2 justify-between max-w-4xl mx-auto w-full p-4 lg:px-8 border-x border-dashed bg-background items-center">
        <Palette className="w-6 h-6" />
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};
