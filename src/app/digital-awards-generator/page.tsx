import React, { Suspense } from "react";
import DigitalAwardsPage from "./ClientPage";
import { Metadata } from "next";

const page = () => {
  return (
    <>
      <Suspense fallback={null}>
        <DigitalAwardsPage />
      </Suspense>
    </>
  );
};

export default page;
