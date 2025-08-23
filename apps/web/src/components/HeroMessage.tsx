'use client';

import React, { useState, useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const phrases = [
  "Man and van London to Manchester from £65",
  "Full home removal Manchester to Glasgow from £180",
  "Affordable move Birmingham to Edinburgh for £150",
  "Express van service London to Bristol from £70",
  "Student move Leeds to London for just £80",
  "Flat removal Liverpool to Birmingham £95",
  "Quick move Sheffield to Newcastle £110",
  "Professional removal Glasgow to Aberdeen £120",
  "Man and van Cardiff to London from £130",
  "Reliable move Edinburgh to Dundee £90",
  "House removal London to Oxford £85",
  "Same-day van Manchester to Liverpool £75",
  "Budget removal Birmingham to Leeds £105",
  "Office relocation London to Reading £150",
  "Move fast: Bristol to Cardiff £70",
  "Secure move Nottingham to Manchester £95",
  "Van hire Glasgow to Stirling £65",
  "Smooth move London to Brighton £85",
  "Best price: London to Cambridge £80",
  "Affordable removal Manchester to York £90",
  "Instant quote London to Leicester £95",
  "Trusted movers Birmingham to Coventry £70",
  "Van service Edinburgh to Glasgow £60",
  "Home removal London to Southampton £120",
  "Flat move Newcastle to Leeds £95",
  "Student relocation London to Sheffield £100",
  "Quick removal Cardiff to Bristol £60",
  "Professional move Liverpool to Manchester £75",
  "House removal Glasgow to Inverness £150",
  "Fast booking: London to Birmingham £85",
  "Efficient move Manchester to Edinburgh £140",
  "Van hire London to Nottingham £95",
  "Affordable move Leeds to Liverpool £80",
  "Reliable man and van Oxford to London £75",
  "Office relocation Manchester to Birmingham £160",
  "Flat removal London to Milton Keynes £85",
  "Student move Birmingham to Sheffield £70",
  "Quick van service Glasgow to London £200",
  "House removal Edinburgh to Aberdeen £130",
  "Low-cost move London to York £110",
  "Fast service Bristol to London £100",
  "Affordable relocation Manchester to Leicester £90",
  "Trusted movers Liverpool to Leeds £85",
  "Professional van London to Reading £95",
  "Budget student move Cardiff to Manchester £105",
  "Quick service Newcastle to London £180",
  "House move London to Exeter £150",
  "Van hire Birmingham to Glasgow £190",
  "Affordable home removal Leeds to Edinburgh £130",
  "Reliable man and van London to Coventry £95",
  "Student flat move Oxford to Cambridge £70",
  "Quick relocation Liverpool to Sheffield £85",
  "House removal London to Norwich £120",
  "Fast van service Manchester to Bristol £110",
  "Affordable move Birmingham to Nottingham £80",
  "Trusted movers Glasgow to Dundee £65",
  "Quick service London to Bath £95",
  "Efficient removal Manchester to Newcastle £100",
  "Budget-friendly move Edinburgh to London £170"
];

const MotionHeading = motion(Heading);

export default function HeroMessage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box as="section" textAlign="center" py={20}>
      <AnimatePresence mode="wait">
        <MotionHeading
          key={currentIndex}
          size="2xl"
          mb={4}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          bgGradient="linear(to-r, #00E0FF, #B026FF)"
          bgClip="text"
          fontWeight="bold"
          aria-live="polite"
          aria-label={`Current message: ${phrases[currentIndex]}`}
        >
          {phrases[currentIndex]}
        </MotionHeading>
      </AnimatePresence>
      
      {/* Hidden phrases for SEO - all phrases remain in DOM */}
      <Box as="div" display="none" aria-hidden="true">
        {phrases.map((phrase, i) => (
          <p key={i}>{phrase}</p>
        ))}
      </Box>
    </Box>
  );
}
