"use client";

import Carousel, { ImageProps } from "@/components/home/Carousel";

const images: ImageProps[] = [
  {
    url: "/boring1.png",
    alt: "L**tc*de",
  },
  {
    url: "/boring2.png",
    alt: "H*ckerr*nk",
  },
  {
    url: "/boring3.png",
    alt: "K*ttis",
  },
];

const BoringSlideShow = () => {
  return <Carousel images={images} />;
};

export default BoringSlideShow;
