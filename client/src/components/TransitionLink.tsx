"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, LinkProps } from "react-router-dom";

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  to: string;
  time?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({
  children,
  time = 500, // Default time if none is provided
  to,
  ...props
}) => {
  const router = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleTransition = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();

    const body = document.querySelector("body");

    // Show the loading state and apply transition class
    setIsLoading(true);
    body?.classList.add("page-transition");

    // Wait for the transition animation time
    await sleep(500);

    // Navigate to the new page
    router(to);

    // Additional sleep for any post-transition effects
    await sleep(500);

    // Clean up the loading state
    body?.classList.remove("page-transition");
    setIsLoading(false);
  };

  return (
    <>
      <Link {...props} to={to} onClick={handleTransition}>
        {children}
      </Link>
      {isLoading && (
        <>
          <div id="black-screen" className="fixed inset-0 bg-black z-50" />
          <div className="orbiting-ion">
            <div className="ion" />
          </div>
        </>
      )}
    </>
  );
};
